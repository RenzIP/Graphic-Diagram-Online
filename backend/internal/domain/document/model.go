package document

import (
	"encoding/json"
	"time"

	"github.com/uptrace/bun"
)

// Node matches frontend Node type from lib/stores/document.ts
type Node struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Position Position        `json:"position"`
	Width    *float64        `json:"width,omitempty"`
	Height   *float64        `json:"height,omitempty"`
	Label    string          `json:"label"`
	Color    string          `json:"color,omitempty"`
	Data     json.RawMessage `json:"data,omitempty"`
}

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Edge matches frontend Edge type from lib/stores/document.ts
type Edge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
	Type   string `json:"type,omitempty"`
	Label  string `json:"label,omitempty"`
}

// DocumentContent matches frontend DocumentState { nodes, edges }
type DocumentContent struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

// DocumentView matches frontend view JSONB { positions, styles, routing }
type DocumentView struct {
	Positions map[string]Position               `json:"positions"`
	Styles    map[string]map[string]interface{} `json:"styles"`
	Routing   map[string]interface{}            `json:"routing"`
}

// Document is the full database model
type Document struct {
	bun.BaseModel `bun:"table:documents,alias:d"`

	ID          string          `bun:"id,pk,type:uuid,default:gen_random_uuid()" json:"id"`
	ProjectID   string          `bun:"project_id,type:uuid" json:"project_id"`
	Title       string          `bun:"title,notnull" json:"title"`
	DiagramType string          `bun:"diagram_type,notnull" json:"diagram_type"`
	Content     json.RawMessage `bun:"content,type:jsonb,notnull" json:"content"`
	View        json.RawMessage `bun:"view,type:jsonb,notnull" json:"view"`
	Version     int             `bun:"version,notnull,default:1" json:"version"`
	CreatedBy   string          `bun:"created_by,notnull" json:"created_by"`
	CreatedAt   time.Time       `bun:"created_at,notnull,default:now()" json:"created_at"`
	UpdatedAt   time.Time       `bun:"updated_at,notnull,default:now()" json:"updated_at"`
}

// DocumentMeta matches frontend DocumentMeta (no content/view)
type DocumentMeta struct {
	bun.BaseModel `bun:"table:documents,alias:d"`

	ID          string    `bun:"id,pk,type:uuid" json:"id"`
	ProjectID   string    `bun:"project_id,type:uuid" json:"project_id"`
	Title       string    `bun:"title" json:"title"`
	DiagramType string    `bun:"diagram_type" json:"diagram_type"`
	Version     int       `bun:"version" json:"version"`
	CreatedBy   string    `bun:"created_by" json:"created_by"`
	CreatedAt   time.Time `bun:"created_at" json:"created_at"`
	UpdatedAt   time.Time `bun:"updated_at" json:"updated_at"`
}

// CreateDocumentRequest matches frontend DocumentCreate from lib/api/documents.ts
// Also supports frontend utils/api.ts which sends { title, content } without project_id
type CreateDocumentRequest struct {
	ProjectID   string          `json:"project_id"`
	Title       string          `json:"title"`
	DiagramType string          `json:"diagram_type"`
	Content     json.RawMessage `json:"content,omitempty"`
}

// Workspace model
type Workspace struct {
	bun.BaseModel `bun:"table:workspaces,alias:w"`

	ID          string    `bun:"id,pk,type:uuid,default:gen_random_uuid()" json:"id"`
	Name        string    `bun:"name,notnull" json:"name"`
	OwnerID     string    `bun:"owner_id,notnull" json:"owner_id"`
	CreatedAt   time.Time `bun:"created_at,notnull,default:now()" json:"created_at"`
	MemberCount int       `bun:"member_count,notnull,default:1" json:"member_count"`
}

type CreateWorkspaceRequest struct {
	Name string `json:"name"`
}

// Project model
type Project struct {
	bun.BaseModel `bun:"table:projects,alias:p"`

	ID            string    `bun:"id,pk,type:uuid,default:gen_random_uuid()" json:"id"`
	WorkspaceID   string    `bun:"workspace_id,type:uuid,notnull" json:"workspace_id"`
	Name          string    `bun:"name,notnull" json:"name"`
	CreatedAt     time.Time `bun:"created_at,notnull,default:now()" json:"created_at"`
	DocumentCount int       `bun:"document_count,notnull,default:0" json:"document_count"`
}

type CreateProjectRequest struct {
	WorkspaceID string `json:"workspace_id"`
	Name        string `json:"name"`
}
