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
	return &dto.AuthMeResp{
		ID:        user.ID.String(),
		Email:     user.Email,
		FullName:  user.FullName,
		AvatarURL: user.AvatarURL,
	}, nil
}

// Register creates a new credential-based account.
func (s *AuthService) Register(ctx context.Context, req dto.RegisterReq) (*model.UserProfile, *pkg.AppError) {
	email := normalizeEmail(req.Email)
	fullName := strings.TrimSpace(req.FullName)

	if _, appErr := s.userRepo.FindByEmail(ctx, email); appErr == nil {
		return nil, pkg.ErrConflict.WithMessage("email already registered")
	} else if appErr.Code != pkg.ErrNotFound.Code {
		return nil, appErr
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to secure password").WithDetails(err.Error())
	}

	user := &model.UserProfile{
		ID:           uuid.New(),
		Email:        email,
		FullName:     strPtr(fullName),
		PasswordHash: strPtr(string(hash)),
		CreatedAt:    time.Now(),
	}

	if appErr := s.userRepo.Insert(ctx, user); appErr != nil {
		return nil, appErr
	}

	return user, nil
}

// Login authenticates a credential-based account.
func (s *AuthService) Login(ctx context.Context, req dto.LoginReq) (*model.UserProfile, *pkg.AppError) {
	user, appErr := s.userRepo.FindByEmail(ctx, normalizeEmail(req.Email))
	if appErr != nil {
		if appErr.Code == pkg.ErrNotFound.Code {
			return nil, pkg.ErrUnauthorized.WithMessage("email atau password salah")
		}
		return nil, appErr
	}

	if user.PasswordHash == nil || *user.PasswordHash == "" {
		return nil, pkg.ErrUnauthorized.WithMessage("akun ini belum mendukung login password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, pkg.ErrUnauthorized.WithMessage("email atau password salah")
	}

	return user, nil
}

// UpsertProfile creates or updates a user profile (called during OAuth callback).
func (s *AuthService) UpsertProfile(ctx context.Context, userID uuid.UUID, email string, fullName, avatarURL *string) *pkg.AppError {
	user := &model.UserProfile{
		ID:        userID,
		Email:     normalizeEmail(email),
		FullName:  fullName,
		AvatarURL: avatarURL,
		CreatedAt: time.Now(),
	}
	return s.userRepo.Upsert(ctx, user)
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
