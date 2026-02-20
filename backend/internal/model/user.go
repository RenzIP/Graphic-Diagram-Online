package model

import (
	"time"

	"github.com/google/uuid"
)

// UserProfile mirrors the user_profiles collection.
type UserProfile struct {
	ID        uuid.UUID `bson:"_id"        json:"id"`
	Email     string    `bson:"email"      json:"email"`
	FullName  *string   `bson:"full_name"  json:"full_name"`
	AvatarURL *string   `bson:"avatar_url" json:"avatar_url"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}
