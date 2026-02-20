package service

import (
	"context"
	"time"

	"github.com/google/uuid"

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

// UpsertProfile creates or updates a user profile (called during OAuth callback).
func (s *AuthService) UpsertProfile(ctx context.Context, userID uuid.UUID, email string, fullName, avatarURL *string) *pkg.AppError {
	user := &model.UserProfile{
		ID:        userID,
		Email:     email,
		FullName:  fullName,
		AvatarURL: avatarURL,
		CreatedAt: time.Now(),
	}
	return s.userRepo.Upsert(ctx, user)
}
