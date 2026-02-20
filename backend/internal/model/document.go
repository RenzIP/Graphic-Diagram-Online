package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Document mirrors the documents collection.
// content and view are stored as json.RawMessage (opaque JSON pass-through).
type Document struct {
	ID          uuid.UUID       `bson:"_id"          json:"id"`
	ProjectID   *uuid.UUID      `bson:"project_id"   json:"project_id"`
	WorkspaceID uuid.UUID       `bson:"workspace_id" json:"workspace_id"`
	Title       string          `bson:"title"        json:"title"`
	DiagramType string          `bson:"diagram_type" json:"diagram_type"`
	Content     json.RawMessage `bson:"content"      json:"content"`
	View        json.RawMessage `bson:"view"         json:"view"`
	Version     int             `bson:"version"      json:"version"`
	CreatedBy   *uuid.UUID      `bson:"created_by"   json:"created_by"`
	CreatedAt   time.Time       `bson:"created_at"   json:"created_at"`
	UpdatedAt   time.Time       `bson:"updated_at"   json:"updated_at"`
}
