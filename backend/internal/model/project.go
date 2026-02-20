package model

import (
	"time"

	"github.com/google/uuid"
)

// Project mirrors the projects collection.
type Project struct {
	ID          uuid.UUID  `bson:"_id"          json:"id"`
	WorkspaceID uuid.UUID  `bson:"workspace_id" json:"workspace_id"`
	Name        string     `bson:"name"         json:"name"`
	Description *string    `bson:"description"  json:"description"`
	CreatedBy   *uuid.UUID `bson:"created_by"   json:"created_by"`
	CreatedAt   time.Time  `bson:"created_at"   json:"created_at"`
	UpdatedAt   time.Time  `bson:"updated_at"   json:"updated_at"`
}
