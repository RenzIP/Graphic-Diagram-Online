package repository

import (
	"context"
	"errors"

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

// EnsureIndexes creates the indexes needed by auth flows.
func (r *UserRepo) EnsureIndexes(ctx context.Context) error {
	_, err := r.col.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "email", Value: 1}},
		Options: options.Index().
			SetUnique(true).
			SetSparse(true),
	})
	return err
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

// FindByEmail returns a user profile by normalized email.
func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*model.UserProfile, *pkg.AppError) {
	user := new(model.UserProfile)
	err := r.col.FindOne(ctx, bson.M{"email": email}).Decode(user)
	if appErr := handleMongoError(err, "user profile"); appErr != nil {
		return nil, appErr
	}
	return user, nil
}

// Insert creates a new user profile.
func (r *UserRepo) Insert(ctx context.Context, user *model.UserProfile) *pkg.AppError {
	_, err := r.col.InsertOne(ctx, user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return pkg.ErrConflict.WithMessage("email already registered")
		}
		if errors.Is(err, mongo.ErrClientDisconnected) {
			return pkg.ErrInternal.WithMessage("database connection lost").WithDetails(err.Error())
		}
		return pkg.ErrInternal.WithMessage("failed to create user profile").WithDetails(err.Error())
	}
	return nil
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
			"_id":           user.ID,
			"created_at":    user.CreatedAt,
			"password_hash": user.PasswordHash,
		},
	}
	opts := options.UpdateOne().SetUpsert(true)

	_, err := r.col.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return pkg.ErrConflict.WithMessage("email already registered")
		}
		return pkg.ErrInternal.WithMessage("failed to upsert user profile").WithDetails(err.Error())
	}
	return nil
}
