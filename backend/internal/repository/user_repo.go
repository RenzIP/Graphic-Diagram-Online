package repository

import (
	"context"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// UserRepo handles user_profiles collection operations.
type UserRepo struct {
	col *mongo.Collection
}

// NewUserRepo creates a new UserRepo.
func NewUserRepo(db *mongo.Database) *UserRepo {
	return &UserRepo{col: db.Collection("user_profiles")}
}

// FindByID returns a user profile by ID.
func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(user)
	if appErr := handleMongoError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

// Upsert inserts or updates a user profile (used during auth callback).
func (r *UserRepo) Upsert(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	filter := bson.M{"_id": user.ID}
	update := bson.M{
		"$set": bson.M{
			"email":      user.Email,
			"full_name":  user.FullName,
			"avatar_url": user.AvatarURL,
		},
		"$setOnInsert": bson.M{
			"_id":        user.ID,
			"created_at": user.CreatedAt,
		},
	}
	opts := options.UpdateOne().SetUpsert(true)

	_, err := r.col.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to upsert user profile").WithDetails(err.Error())
	}
	return nil
}
