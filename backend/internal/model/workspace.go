package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Workspace mirrors the workspaces table.
type Workspace struct {
	bun.BaseModel `bun:"table:workspaces,alias:w"`

	ID          uuid.UUID `bun:"id,pk,type:uuid,default:gen_random_uuid()"  json:"id"`
	Name        string    `bun:"name,notnull"                                json:"name"`
	Slug        string    `bun:"slug,notnull,unique"                         json:"slug"`
	OwnerID     uuid.UUID `bun:"owner_id,type:uuid,notnull"                  json:"owner_id"`
	Description *string   `bun:"description"                                 json:"description"`
	CreatedAt   time.Time `bun:"created_at,default:now()"                    json:"created_at"`
	UpdatedAt   time.Time `bun:"updated_at,default:now()"                    json:"updated_at"`

	// Relations (not stored in DB, loaded via Bun relations)
	Owner   *UserProfile      `bun:"rel:belongs-to,join:owner_id=id" json:"-"`
	Members []WorkspaceMember `bun:"rel:has-many,join:id=workspace_id" json:"-"`
}

// WorkspaceMember mirrors the workspace_members junction table.
// Composite PK: (workspace_id, user_id).
type WorkspaceMember struct {
	bun.BaseModel `bun:"table:workspace_members,alias:wm"`

	WorkspaceID uuid.UUID `bun:"workspace_id,pk,type:uuid,notnull" json:"workspace_id"`
	UserID      uuid.UUID `bun:"user_id,pk,type:uuid,notnull"      json:"user_id"`
	Role        string    `bun:"role,notnull"                       json:"role"` // owner | editor | viewer
	JoinedAt    time.Time `bun:"joined_at,default:now()"            json:"joined_at"`

	// Relations
	Workspace *Workspace   `bun:"rel:belongs-to,join:workspace_id=id" json:"-"`
	User      *UserProfile `bun:"rel:belongs-to,join:user_id=id"      json:"-"`
}
