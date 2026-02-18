package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// UserProfile mirrors the user_profiles table.
// PK references Supabase auth.users(id).
type UserProfile struct {
	bun.BaseModel `bun:"table:user_profiles,alias:up"`

	ID        uuid.UUID `bun:"id,pk,type:uuid"             json:"id"`
	FullName  *string   `bun:"full_name"                    json:"full_name"`
	AvatarURL *string   `bun:"avatar_url"                   json:"avatar_url"`
	CreatedAt time.Time `bun:"created_at,default:now()"     json:"created_at"`
}
