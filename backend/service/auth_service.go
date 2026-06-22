package service

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/RenzIP/Graphic-Diagram-Online/dto"
	"github.com/RenzIP/Graphic-Diagram-Online/model"
	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
	"github.com/RenzIP/Graphic-Diagram-Online/repository"
)

type AuthService struct {
	userRepo *repository.UserRepo
}

func NewAuthService(userRepo *repository.UserRepo) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) GetProfile(ctx context.Context, userID uuid.UUID) (*dto.AuthMeResp, *pkg.AppError) {
	user, appErr := s.userRepo.FindByID(ctx, userID)
	if appErr != nil {
		return nil, appErr
	}
	if user == nil {
		return nil, pkg.ErrNotFound.WithMessage("user not found")
	}

	return userResponse(user), nil
}

func (s *AuthService) Register(ctx context.Context, req dto.RegisterReq) (*model.UserProfile, *pkg.AppError) {
	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	if req.Role == "" {
		req.Role = "user"
	}

	if appErr := pkg.Validate(req); appErr != nil {
		return nil, appErr
	}

	existingUser, appErr := s.userRepo.FindByUsername(ctx, req.Username)
	if appErr != nil {
		return nil, appErr
	}
	if existingUser != nil {
		return nil, pkg.ErrConflict.WithMessage("username already registered")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to hash password")
	}

	hash := string(passwordHash)
	user := &model.UserProfile{
		ID:        uuid.New(),
		Username:  req.Username,
		Password:  &hash,
		Role:      req.Role,
		CreatedAt: time.Now(),
	}
	if appErr := s.userRepo.Create(ctx, user); appErr != nil {
		return nil, appErr
	}

	return user, nil
}

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

func (s *AuthService) ChangePassword(ctx context.Context, userID uuid.UUID, req dto.ChangePasswordReq) *pkg.AppError {
	if appErr := pkg.Validate(req); appErr != nil {
		return appErr
	}

	user, appErr := s.userRepo.FindByID(ctx, userID)
	if appErr != nil {
		return appErr
	}
	if user == nil {
		return pkg.ErrNotFound.WithMessage("user not found")
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

func (s *AuthService) UserResponse(user *model.UserProfile) dto.AuthUserResp {
	return *userResponse(user)
}

func (s *AuthService) UpsertProfile(ctx context.Context, userID uuid.UUID, email string, fullName, avatarURL *string) *pkg.AppError {
	email = strings.ToLower(strings.TrimSpace(email))
	username := usernameFromOAuth(email, fullName, userID)

	user := &model.UserProfile{
		ID:        userID,
		Username:  username,
		Email:     optionalString(email),
		FullName:  fullName,
		AvatarURL: avatarURL,
		Role:      "user",
		CreatedAt: time.Now(),
	}

	return s.userRepo.Upsert(ctx, user)
}

func userResponse(user *model.UserProfile) *dto.AuthMeResp {
	return &dto.AuthMeResp{
		ID:       user.ID.String(),
		Username: user.Username,
		Role:     user.Role,
	}
}

func usernameFromOAuth(email string, fullName *string, userID uuid.UUID) string {
	suffix := strings.ReplaceAll(userID.String(), "-", "")
	if len(suffix) > 8 {
		suffix = suffix[:8]
	}

	if email != "" {
		base := strings.Split(email, "@")[0]
		base = strings.ToLower(strings.TrimSpace(base))
		if base != "" {
			return base + "_" + suffix
		}
	}
	if fullName != nil {
		base := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(*fullName), " ", "_"))
		if base != "" {
			return base + "_" + suffix
		}
	}

	return "user_" + strings.ReplaceAll(userID.String(), "-", "")
}

func optionalString(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
