package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/RenzIP/Graphic-Diagram-Online/model"
	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.UserProfile, *pkg.AppError) {
	var user model.UserProfile
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, pkg.ErrInternal.WithMessage("failed to find user")
	}

	return &user, nil
}

func (r *UserRepo) FindByUsername(ctx context.Context, username string) (*model.UserProfile, *pkg.AppError) {
	var user model.UserProfile
	if err := r.db.WithContext(ctx).
		First(&user, "LOWER(username) = ?", strings.ToLower(username)).
		Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, pkg.ErrInternal.WithMessage("failed to find user")
	}

	return &user, nil
}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*model.UserProfile, *pkg.AppError) {
	var user model.UserProfile
	if err := r.db.WithContext(ctx).
		First(&user, "LOWER(email) = ?", strings.ToLower(email)).
		Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, pkg.ErrInternal.WithMessage("failed to find user")
	}

	return &user, nil
}

func (r *UserRepo) FindByUsernameOrEmail(ctx context.Context, identifier string) (*model.UserProfile, *pkg.AppError) {
	normalized := strings.ToLower(strings.TrimSpace(identifier))

	var user model.UserProfile
	if err := r.db.WithContext(ctx).
		First(&user, "LOWER(username) = ? OR LOWER(email) = ?", normalized, normalized).
		Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, pkg.ErrInternal.WithMessage("failed to find user")
	}

	return &user, nil
}

func (r *UserRepo) Create(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		if isDuplicateError(err) {
			return pkg.ErrConflict.WithMessage("username already registered")
		}
		return pkg.ErrInternal.WithMessage("failed to create user")
	}

	return nil
}

func (r *UserRepo) UpdatePassword(ctx context.Context, id uuid.UUID, password string) *pkg.AppError {
	result := r.db.WithContext(ctx).
		Model(&model.UserProfile{}).
		Where("id = ?", id).
		Update("password", password)
	if result.Error != nil {
		return pkg.ErrInternal.WithMessage("failed to update password")
	}
	if result.RowsAffected == 0 {
		return pkg.ErrNotFound.WithMessage("user not found")
	}

	return nil
}

func (r *UserRepo) Upsert(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	if err := r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"username",
				"email",
				"full_name",
				"avatar_url",
				"role",
			}),
		}).
		Create(user).Error; err != nil {
		if isDuplicateError(err) {
			return pkg.ErrConflict.WithMessage("username already registered")
		}
		return pkg.ErrInternal.WithMessage("failed to upsert user")
	}

	return nil
}

func isDuplicateError(err error) bool {
	return strings.Contains(strings.ToLower(err.Error()), "duplicate")
}
