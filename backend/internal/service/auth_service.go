package service

import (
	"context"

	"github.com/google/uuid"

	"github.com/renzip/GraDiOl/internal/dto"
	"github.com/renzip/GraDiOl/internal/model"
	"github.com/renzip/GraDiOl/internal/pkg"
	"github.com/renzip/GraDiOl/internal/repository"
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
		Email:     "", // email comes from JWT claims, not DB
		FullName:  user.FullName,
		AvatarURL: user.AvatarURL,
	}, nil
}

// UpsertProfile creates or updates a user profile (called during auth callback).
func (s *AuthService) UpsertProfile(ctx context.Context, userID uuid.UUID, fullName, avatarURL *string) *pkg.AppError {
	user := &model.UserProfile{
		ID:        userID,
		FullName:  fullName,
		AvatarURL: avatarURL,
	}
	return s.userRepo.Upsert(ctx, user)
}
