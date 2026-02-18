package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Project mirrors the projects table.
type Project struct {
	bun.BaseModel `bun:"table:projects,alias:p"`

	ID          uuid.UUID  `bun:"id,pk,type:uuid,default:gen_random_uuid()"  json:"id"`
	WorkspaceID uuid.UUID  `bun:"workspace_id,type:uuid,notnull"             json:"workspace_id"`
	Name        string     `bun:"name,notnull"                                json:"name"`
	Description *string    `bun:"description"                                 json:"description"`
	CreatedBy   *uuid.UUID `bun:"created_by,type:uuid"                        json:"created_by"`
	CreatedAt   time.Time  `bun:"created_at,default:now()"                    json:"created_at"`
	UpdatedAt   time.Time  `bun:"updated_at,default:now()"                    json:"updated_at"`

	// Relations
	Workspace *Workspace   `bun:"rel:belongs-to,join:workspace_id=id" json:"-"`
	Creator   *UserProfile `bun:"rel:belongs-to,join:created_by=id"   json:"-"`
}
