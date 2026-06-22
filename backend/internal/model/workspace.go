package model

import (
	"time"

	"github.com/google/uuid"
)

// Workspace mirrors the workspaces table.
type Workspace struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Slug        string    `json:"slug" gorm:"uniqueIndex;not null"`
	OwnerID     uuid.UUID `json:"owner_id" gorm:"type:uuid;not null"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// WorkspaceMember mirrors the workspace_members table.
// Composite key: (workspace_id, user_id).
type WorkspaceMember struct {
	WorkspaceID uuid.UUID `json:"workspace_id" gorm:"type:uuid;primaryKey"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;primaryKey"`
	Role        string    `json:"role" gorm:"not null"` // owner | editor | viewer
	JoinedAt    time.Time `json:"joined_at"`
}
