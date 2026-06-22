package model

import (
	"time"

	"github.com/google/uuid"
)

// Project mirrors the projects table.
type Project struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey"`
	WorkspaceID uuid.UUID  `json:"workspace_id" gorm:"type:uuid;not null"`
	Name        string     `json:"name" gorm:"not null"`
	Description *string    `json:"description"`
	CreatedBy   *uuid.UUID `json:"created_by" gorm:"type:uuid"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
