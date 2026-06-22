package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.db.WithContext(ctx).First(user, "id = ?", id).Error
	if appErr := handleGormError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.db.WithContext(ctx).First(user, "email = ?", email).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if appErr := handleGormError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

func (r *UserRepo) FindByUsername(ctx context.Context, username string) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.db.WithContext(ctx).First(user, "username = ?", username).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if appErr := handleGormError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

func (r *UserRepo) FindByUsernameOrEmail(ctx context.Context, identifier string) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.db.WithContext(ctx).
		Where("email = ? OR username = ?", identifier, identifier).
		First(user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if appErr := handleGormError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

func (r *UserRepo) Create(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to create user profile").WithDetails(err.Error())
	}
	return nil
}

func (r *UserRepo) UpdatePassword(ctx context.Context, userID uuid.UUID, password string) *pkg.AppError {
	err := r.db.WithContext(ctx).
		Model(&model.UserProfile{}).
		Where("id = ?", userID).
		Update("password", password).Error
	if appErr := handleGormError(err, "user profile"); appErr != nil {
		return appErr
	}
	return nil
}

func (r *UserRepo) Upsert(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	err := r.db.WithContext(ctx).
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
		Create(user).Error
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to upsert user profile").WithDetails(err.Error())
	}
	return nil
}
