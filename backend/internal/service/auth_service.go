package service

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/dto"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/repository"
)

// AuthService handles authentication-related business logic.
type AuthService struct {
	userRepo *repository.UserRepo
}

// NewAuthService creates a new AuthService.
func NewAuthService(userRepo *repository.UserRepo) *AuthService {
	return &AuthService{userRepo: userRepo}
}

// GetProfile returns the current user's profile by their JWT sub claim.
func (s *AuthService) GetProfile(ctx context.Context, userID uuid.UUID) (*dto.AuthMeResp, *pkg.AppError) {
	user, appErr := s.userRepo.FindByID(ctx, userID)
	if appErr != nil {
		return nil, appErr
	}
	return userResponse(user), nil
}

// Register creates a password-auth user and stores only the bcrypt hash.
func (s *AuthService) Register(ctx context.Context, req dto.RegisterReq) (*model.UserProfile, *pkg.AppError) {
	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	if req.Role == "" {
		req.Role = "user"
	}

	if appErr := pkg.Validate(req); appErr != nil {
		return nil, appErr
	}

	existingUsername, appErr := s.userRepo.FindByUsername(ctx, req.Username)
	if appErr != nil {
		return nil, appErr
	}
	if existingUsername != nil {
		return nil, pkg.ErrConflict.WithMessage("username already registered")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to hash password")
	}

	username := req.Username
	hash := string(passwordHash)
	user := &model.UserProfile{
		ID:        uuid.New(),
		Username:  username,
		Password:  &hash,
		Role:      req.Role,
		CreatedAt: time.Now(),
	}
	if appErr := s.userRepo.Create(ctx, user); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

// Login authenticates a username/email and password pair with bcrypt.
func (s *AuthService) Login(ctx context.Context, req dto.LoginReq) (*model.UserProfile, *pkg.AppError) {
	req.Identifier = strings.ToLower(strings.TrimSpace(req.Identifier))
	if appErr := pkg.Validate(req); appErr != nil {
		return nil, appErr
	}

	user, appErr := s.userRepo.FindByUsernameOrEmail(ctx, req.Identifier)
	if appErr != nil {
		return nil, appErr
	}
	if user == nil || user.Password == nil || *user.Password == "" {
		return nil, pkg.ErrUnauthorized.WithMessage("invalid username/email or password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(req.Password)); err != nil {
		return nil, pkg.ErrUnauthorized.WithMessage("invalid username/email or password")
	}

	return user, nil
}

// ChangePassword verifies the current password and replaces it with a new bcrypt hash.
func (s *AuthService) ChangePassword(ctx context.Context, userID uuid.UUID, req dto.ChangePasswordReq) *pkg.AppError {
	if appErr := pkg.Validate(req); appErr != nil {
		return appErr
	}

	user, appErr := s.userRepo.FindByID(ctx, userID)
	if appErr != nil {
		return appErr
	}
	if user.Password == nil || *user.Password == "" {
		return pkg.ErrBadRequest.WithMessage("password login is not available for this account")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(req.CurrentPassword)); err != nil {
		return pkg.ErrUnauthorized.WithMessage("current password is invalid")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to hash password")
	}

	return s.userRepo.UpdatePassword(ctx, userID, string(passwordHash))
}

// UserResponse maps a user model into a public auth response.
func (s *AuthService) UserResponse(user *model.UserProfile) dto.AuthUserResp {
	return *userResponse(user)
}

func userResponse(user *model.UserProfile) *dto.AuthMeResp {
	return &dto.AuthMeResp{
		ID:       user.ID.String(),
		Username: user.Username,
		Role:     user.Role,
	}
}

// UpsertProfile creates or updates a user profile (called during OAuth callback).
func (s *AuthService) UpsertProfile(ctx context.Context, userID uuid.UUID, email string, fullName, avatarURL *string) *pkg.AppError {
	email = strings.ToLower(strings.TrimSpace(email))
	username := usernameFromOAuth(email, fullName, userID)
	user := &model.UserProfile{
		ID:        userID,
		Username:  username,
		Email:     &email,
		FullName:  fullName,
		AvatarURL: avatarURL,
		Role:      "user",
		CreatedAt: time.Now(),
	}
	return s.userRepo.Upsert(ctx, user)
}

func usernameFromOAuth(email string, fullName *string, userID uuid.UUID) string {
	if email != "" {
		return strings.ToLower(strings.Split(email, "@")[0])
	}
	if fullName != nil {
		username := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(*fullName), " ", "_"))
		if username != "" {
			return username
		}
	}
	return "user_" + strings.ReplaceAll(userID.String(), "-", "")
}
