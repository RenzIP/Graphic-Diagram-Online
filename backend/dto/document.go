package dto

import (
	"encoding/json"
	"time"
)

// CreateDocumentReq is the body for POST /api/documents.
type CreateDocumentReq struct {
	WorkspaceID string           `json:"workspace_id" validate:"required,uuid"`
	ProjectID   *string          `json:"project_id"   validate:"omitempty,uuid"`
	Title       string           `json:"title"        validate:"omitempty,max=200"`
	DiagramType string           `json:"diagram_type" validate:"required,oneof=flowchart erd usecase"`
	Content     *json.RawMessage `json:"content"`
	View        *json.RawMessage `json:"view"`
}

// UpdateDocumentReq is the body for PUT /api/documents/:id.
type UpdateDocumentReq struct {
	Title     *string          `json:"title"      validate:"omitempty,max=200"`
	ProjectID *string          `json:"project_id"` // nullable — can move or set to null
	Content   *json.RawMessage `json:"content"`
	View      *json.RawMessage `json:"view"`
}

// DocumentResp is the full response for a single document (GET /api/documents/:id).
type DocumentResp struct {
	ID          string          `json:"id"`
	ProjectID   *string         `json:"project_id"`
	WorkspaceID string          `json:"workspace_id"`
	Title       string          `json:"title"`
	DiagramType string          `json:"diagram_type"`
	Content     json.RawMessage `json:"content"`
	View        json.RawMessage `json:"view"`
	Version     int             `json:"version"`
	CreatedBy   *string         `json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// DocumentListItem is a lightweight document for list responses (no content/view).
type DocumentListItem struct {
	ID          string    `json:"id"`
	ProjectID   *string   `json:"project_id"`
	WorkspaceID string    `json:"workspace_id"`
	Title       string    `json:"title"`
	DiagramType string    `json:"diagram_type"`
	Version     int       `json:"version"`
	CreatedBy   *string   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// DocumentListResp is the paginated response for GET /api/projects/:id/documents.
type DocumentListResp struct {
	Data []DocumentListItem `json:"data"`
	Meta PaginationMeta     `json:"meta"`
}

// RecentDocumentItem is the response item for GET /api/documents/recent.
type RecentDocumentItem struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	DiagramType   string    `json:"diagram_type"`
	WorkspaceID   string    `json:"workspace_id"`
	WorkspaceName string    `json:"workspace_name"`
	ProjectID     *string   `json:"project_id"`
	ProjectName   *string   `json:"project_name"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// RecentDocumentResp is the response for GET /api/documents/recent.
type RecentDocumentResp struct {
	Data []RecentDocumentItem `json:"data"`
}

// ExportDocumentReq is the body for POST /api/documents/:id/export.
type ExportDocumentReq struct {
	Format     string  `json:"format"     validate:"required,oneof=png svg"`
	Scale      float64 `json:"scale"      validate:"omitempty,min=0.5,max=4"`
	Background string  `json:"background" validate:"omitempty"`
	Padding    int     `json:"padding"    validate:"omitempty,min=0,max=200"`
}
