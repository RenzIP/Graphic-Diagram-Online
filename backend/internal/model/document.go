package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Document mirrors the documents table.
// content and view are stored as json.RawMessage (opaque JSONB pass-through).
type Document struct {
	bun.BaseModel `bun:"table:documents,alias:d"`

	ID          uuid.UUID       `bun:"id,pk,type:uuid,default:gen_random_uuid()"  json:"id"`
	ProjectID   *uuid.UUID      `bun:"project_id,type:uuid"                        json:"project_id"`
	WorkspaceID uuid.UUID       `bun:"workspace_id,type:uuid,notnull"              json:"workspace_id"`
	Title       string          `bun:"title,notnull,default:'Untitled'"             json:"title"`
	DiagramType string          `bun:"diagram_type,notnull"                         json:"diagram_type"`
	Content     json.RawMessage `bun:"content,type:jsonb,notnull"                   json:"content"`
	View        json.RawMessage `bun:"view,type:jsonb,notnull"                      json:"view"`
	Version     int             `bun:"version,notnull,default:1"                    json:"version"`
	CreatedBy   *uuid.UUID      `bun:"created_by,type:uuid"                         json:"created_by"`
	CreatedAt   time.Time       `bun:"created_at,default:now()"                     json:"created_at"`
	UpdatedAt   time.Time       `bun:"updated_at,default:now()"                     json:"updated_at"`

	// Relations
	Project   *Project     `bun:"rel:belongs-to,join:project_id=id"   json:"-"`
	Workspace *Workspace   `bun:"rel:belongs-to,join:workspace_id=id" json:"-"`
	Creator   *UserProfile `bun:"rel:belongs-to,join:created_by=id"   json:"-"`
}
