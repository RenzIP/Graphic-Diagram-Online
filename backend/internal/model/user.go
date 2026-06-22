package model

import (
	"time"

	"github.com/google/uuid"
)

type UserProfile struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Username  string    `json:"username" gorm:"not null"`
	Password  *string   `json:"-" gorm:"column:password"`
	Role      string    `json:"role" gorm:"not null;default:user"`
	Email     *string   `json:"email,omitempty"`
	FullName  *string   `json:"full_name,omitempty"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at" gorm:"not null"`
}
