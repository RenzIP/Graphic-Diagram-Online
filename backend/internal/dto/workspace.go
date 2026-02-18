package dto

import "time"

// CreateWorkspaceReq is the body for POST /api/workspaces.
type CreateWorkspaceReq struct {
	Name        string  `json:"name"        validate:"required,min=1,max=100"`
	Description *string `json:"description" validate:"omitempty,max=500"`
}

// UpdateWorkspaceReq is the body for PUT /api/workspaces/:id.
type UpdateWorkspaceReq struct {
	Name        *string `json:"name"        validate:"omitempty,min=1,max=100"`
	Description *string `json:"description" validate:"omitempty,max=500"`
}

// WorkspaceResp is the response for a single workspace.
type WorkspaceResp struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	OwnerID     string    `json:"owner_id"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// WorkspaceListItem extends WorkspaceResp with membership context for list responses.
type WorkspaceListItem struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	OwnerID     string    `json:"owner_id"`
	Description *string   `json:"description"`
	Role        string    `json:"role"`
	MemberCount int       `json:"member_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// WorkspaceListResp is the paginated response for GET /api/workspaces.
type WorkspaceListResp struct {
	Data []WorkspaceListItem `json:"data"`
	Meta PaginationMeta      `json:"meta"`
}
