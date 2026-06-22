package dto

import "time"

// CreateProjectReq is the body for POST /api/projects.
type CreateProjectReq struct {
	WorkspaceID string  `json:"workspace_id" validate:"required,uuid"`
	Name        string  `json:"name"         validate:"required,min=1,max=100"`
	Description *string `json:"description"  validate:"omitempty,max=500"`
}

// UpdateProjectReq is the body for PUT /api/projects/:id.
type UpdateProjectReq struct {
	Name        *string `json:"name"        validate:"omitempty,min=1,max=100"`
	Description *string `json:"description" validate:"omitempty,max=500"`
}

// ProjectResp is the response for a single project.
type ProjectResp struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	CreatedBy   *string   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ProjectListItem extends ProjectResp with document count for list responses.
type ProjectListItem struct {
	ID            string    `json:"id"`
	WorkspaceID   string    `json:"workspace_id"`
	Name          string    `json:"name"`
	Description   *string   `json:"description"`
	DocumentCount int       `json:"document_count"`
	CreatedBy     *string   `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ProjectListResp is the paginated response for GET /api/workspaces/:id/projects.
type ProjectListResp struct {
	Data []ProjectListItem `json:"data"`
	Meta PaginationMeta    `json:"meta"`
}
