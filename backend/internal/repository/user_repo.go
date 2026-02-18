package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"

	"github.com/renzip/GraDiOl/internal/model"
	"github.com/renzip/GraDiOl/internal/pkg"
)

// UserRepo handles user_profiles table operations.
type UserRepo struct {
	db *bun.DB
}

// NewUserRepo creates a new UserRepo.
func NewUserRepo(db *bun.DB) *UserRepo {
	return &UserRepo{db: db}
}

// FindByID returns a user profile by ID.
func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.db.NewSelect().Model(user).Where("id = ?", id).Scan(ctx)
	if appErr := handleQueryError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

// Upsert inserts or updates a user profile (used during auth callback).
func (r *UserRepo) Upsert(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	_, err := r.db.NewInsert().
		Model(user).
		On("CONFLICT (id) DO UPDATE").
		Set("full_name = EXCLUDED.full_name").
		Set("avatar_url = EXCLUDED.avatar_url").
		Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to upsert user profile").WithDetails(err.Error())
	}
	return nil
}
