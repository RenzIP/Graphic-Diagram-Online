package document

import (
	"encoding/json"
	"time"
)

// Node matches frontend Node type from lib/stores/document.ts
type Node struct {
	ID       string          `json:"id"              bson:"id"`
	Type     string          `json:"type"            bson:"type"`
	Position Position        `json:"position"        bson:"position"`
	Width    *float64        `json:"width,omitempty" bson:"width,omitempty"`
	Height   *float64        `json:"height,omitempty" bson:"height,omitempty"`
	Label    string          `json:"label"           bson:"label"`
	Color    string          `json:"color,omitempty" bson:"color,omitempty"`
	Data     json.RawMessage `json:"data,omitempty"  bson:"data,omitempty"`
}

type Position struct {
	X float64 `json:"x" bson:"x"`
	Y float64 `json:"y" bson:"y"`
}

// Edge matches frontend Edge type from lib/stores/document.ts
type Edge struct {
	ID     string `json:"id"             bson:"id"`
	Source string `json:"source"         bson:"source"`
	Target string `json:"target"         bson:"target"`
	Type   string `json:"type,omitempty" bson:"type,omitempty"`
	Label  string `json:"label,omitempty" bson:"label,omitempty"`
}

// DocumentContent matches frontend DocumentState { nodes, edges }
type DocumentContent struct {
	Nodes []Node `json:"nodes" bson:"nodes"`
	Edges []Edge `json:"edges" bson:"edges"`
}

// DocumentView matches frontend view JSONB { positions, styles, routing }
type DocumentView struct {
	Positions map[string]Position               `json:"positions" bson:"positions"`
	Styles    map[string]map[string]interface{} `json:"styles"    bson:"styles"`
	Routing   map[string]interface{}            `json:"routing"   bson:"routing"`
}

// Document is the full database model
type Document struct {
	ID          string          `bson:"_id,omitempty"  json:"id"`
	ProjectID   string          `bson:"project_id"     json:"project_id"`
	Title       string          `bson:"title"          json:"title"`
	DiagramType string          `bson:"diagram_type"   json:"diagram_type"`
	Content     json.RawMessage `bson:"content"        json:"content"`
	View        json.RawMessage `bson:"view"           json:"view"`
	Version     int             `bson:"version"        json:"version"`
	CreatedBy   string          `bson:"created_by"     json:"created_by"`
	CreatedAt   time.Time       `bson:"created_at"     json:"created_at"`
	UpdatedAt   time.Time       `bson:"updated_at"     json:"updated_at"`
}

// DocumentMeta matches frontend DocumentMeta (no content/view)
type DocumentMeta struct {
	ID          string    `bson:"_id,omitempty"  json:"id"`
	ProjectID   string    `bson:"project_id"     json:"project_id"`
	Title       string    `bson:"title"          json:"title"`
	DiagramType string    `bson:"diagram_type"   json:"diagram_type"`
	Version     int       `bson:"version"        json:"version"`
	CreatedBy   string    `bson:"created_by"     json:"created_by"`
	CreatedAt   time.Time `bson:"created_at"     json:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"     json:"updated_at"`
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
	ID          string    `bson:"_id,omitempty" json:"id"`
	Name        string    `bson:"name"         json:"name"`
	OwnerID     string    `bson:"owner_id"     json:"owner_id"`
	CreatedAt   time.Time `bson:"created_at"   json:"created_at"`
	MemberCount int       `bson:"member_count" json:"member_count"`
}

type CreateWorkspaceRequest struct {
	Name string `json:"name"`
}

// Project model
type Project struct {
	ID            string    `bson:"_id,omitempty"   json:"id"`
	WorkspaceID   string    `bson:"workspace_id"    json:"workspace_id"`
	Name          string    `bson:"name"            json:"name"`
	CreatedAt     time.Time `bson:"created_at"      json:"created_at"`
	DocumentCount int       `bson:"document_count"  json:"document_count"`
}

type CreateProjectRequest struct {
	WorkspaceID string `json:"workspace_id"`
	Name        string `json:"name"`
}
