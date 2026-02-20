package model

import (
	"time"

	"github.com/google/uuid"
)

// Workspace mirrors the workspaces collection.
type Workspace struct {
	ID          uuid.UUID `bson:"_id"         json:"id"`
	Name        string    `bson:"name"        json:"name"`
	Slug        string    `bson:"slug"        json:"slug"`
	OwnerID     uuid.UUID `bson:"owner_id"    json:"owner_id"`
	Description *string   `bson:"description" json:"description"`
	CreatedAt   time.Time `bson:"created_at"  json:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"  json:"updated_at"`
}

// WorkspaceMember mirrors the workspace_members collection.
// Composite key: (workspace_id, user_id).
type WorkspaceMember struct {
	WorkspaceID uuid.UUID `bson:"workspace_id" json:"workspace_id"`
	UserID      uuid.UUID `bson:"user_id"      json:"user_id"`
	Role        string    `bson:"role"          json:"role"` // owner | editor | viewer
	JoinedAt    time.Time `bson:"joined_at"     json:"joined_at"`
}
