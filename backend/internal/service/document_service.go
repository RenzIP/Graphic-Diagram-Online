package service

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"

	"github.com/renzip/GraDiOl/internal/dto"
	"github.com/renzip/GraDiOl/internal/model"
	"github.com/renzip/GraDiOl/internal/pkg"
	"github.com/renzip/GraDiOl/internal/repository"
)

// DocumentService handles document business logic with authorization.
type DocumentService struct {
	docRepo  *repository.DocumentRepo
	projRepo *repository.ProjectRepo
	wsSvc    *WorkspaceService
}

// NewDocumentService creates a new DocumentService.
func NewDocumentService(docRepo *repository.DocumentRepo, projRepo *repository.ProjectRepo, wsSvc *WorkspaceService) *DocumentService {
	return &DocumentService{docRepo: docRepo, projRepo: projRepo, wsSvc: wsSvc}
}

// ListByProject returns paginated documents for a project. Requires workspace membership.
func (s *DocumentService) ListByProject(ctx context.Context, userID, projectID uuid.UUID, pq dto.PaginationQuery, diagramType, sortBy, sortOrder string) (*dto.DocumentListResp, *pkg.AppError) {
	// We need the project to know its workspace for auth
	proj, appErr := s.findProjectForAuth(ctx, projectID, userID)
	if appErr != nil {
		return nil, appErr
	}
	_ = proj // used only for auth check above

	docs, total, appErr := s.docRepo.FindByProject(ctx, projectID, pq.PerPage, pq.Offset(), diagramType, sortBy, sortOrder)
	if appErr != nil {
		return nil, appErr
	}

	items := make([]dto.DocumentListItem, 0, len(docs))
	for _, d := range docs {
		items = append(items, toDocumentListItem(&d))
	}

	meta := dto.NewPaginationMeta(pq, total)
	return &dto.DocumentListResp{Data: items, Meta: meta}, nil
}

// GetByID returns a single document with full content. Requires workspace membership.
func (s *DocumentService) GetByID(ctx context.Context, userID, docID uuid.UUID) (*dto.DocumentResp, *pkg.AppError) {
	doc, appErr := s.docRepo.FindByID(ctx, docID)
	if appErr != nil {
		return nil, appErr
	}

	// Check workspace membership
	if _, appErr := s.wsSvc.RequireMembership(ctx, doc.WorkspaceID, userID); appErr != nil {
		return nil, appErr
	}

	return toDocumentResp(doc), nil
}

// Create creates a new document. Requires editor or owner role.
func (s *DocumentService) Create(ctx context.Context, userID uuid.UUID, req dto.CreateDocumentReq) (*dto.DocumentResp, *pkg.AppError) {
	if appErr := pkg.Validate(req); appErr != nil {
		return nil, appErr
	}

	workspaceID, err := uuid.Parse(req.WorkspaceID)
	if err != nil {
		return nil, pkg.ErrBadRequest.WithMessage("invalid workspace_id")
	}

	role, appErr := s.wsSvc.RequireMembership(ctx, workspaceID, userID)
	if appErr != nil {
		return nil, appErr
	}
	if role == "viewer" {
		return nil, pkg.ErrForbidden.WithMessage("viewers cannot create documents")
	}

	// Parse optional project_id
	var projectID *uuid.UUID
	if req.ProjectID != nil && *req.ProjectID != "" {
		pid, err := uuid.Parse(*req.ProjectID)
		if err != nil {
			return nil, pkg.ErrBadRequest.WithMessage("invalid project_id")
		}
		projectID = &pid
	}

	title := req.Title
	if title == "" {
		title = "Untitled"
	}

	// Default content/view
	content := json.RawMessage(`{"nodes":[],"edges":[]}`)
	if req.Content != nil {
		content = *req.Content
	}
	view := json.RawMessage(`{"positions":{},"styles":{},"routing":{}}`)
	if req.View != nil {
		view = *req.View
	}

	doc := &model.Document{
		ID:          uuid.New(),
		ProjectID:   projectID,
		WorkspaceID: workspaceID,
		Title:       title,
		DiagramType: req.DiagramType,
		Content:     content,
		View:        view,
		Version:     1,
		CreatedBy:   &userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if appErr := s.docRepo.Insert(ctx, doc); appErr != nil {
		return nil, appErr
	}

	return toDocumentResp(doc), nil
}

// Update modifies a document. Requires editor or owner role.
// Increments version on content/view changes.
func (s *DocumentService) Update(ctx context.Context, userID, docID uuid.UUID, req dto.UpdateDocumentReq) (*dto.DocumentResp, *pkg.AppError) {
	doc, appErr := s.docRepo.FindByID(ctx, docID)
	if appErr != nil {
		return nil, appErr
	}

	role, appErr := s.wsSvc.RequireMembership(ctx, doc.WorkspaceID, userID)
	if appErr != nil {
		return nil, appErr
	}
	if role == "viewer" {
		return nil, pkg.ErrForbidden.WithMessage("viewers cannot update documents")
	}

	bumpVersion := false

	if req.Title != nil {
		doc.Title = *req.Title
	}
	if req.ProjectID != nil {
		if *req.ProjectID == "" {
			doc.ProjectID = nil // set to orphan
		} else {
			pid, err := uuid.Parse(*req.ProjectID)
			if err != nil {
				return nil, pkg.ErrBadRequest.WithMessage("invalid project_id")
			}
			doc.ProjectID = &pid
		}
	}
	if req.Content != nil {
		doc.Content = *req.Content
		bumpVersion = true
	}
	if req.View != nil {
		doc.View = *req.View
		bumpVersion = true
	}

	if bumpVersion {
		doc.Version++
	}
	doc.UpdatedAt = time.Now()

	if appErr := s.docRepo.Update(ctx, doc); appErr != nil {
		return nil, appErr
	}

	return toDocumentResp(doc), nil
}

// Delete removes a document. Owner role only.
func (s *DocumentService) Delete(ctx context.Context, userID, docID uuid.UUID) *pkg.AppError {
	doc, appErr := s.docRepo.FindByID(ctx, docID)
	if appErr != nil {
		return appErr
	}

	role, appErr := s.wsSvc.RequireMembership(ctx, doc.WorkspaceID, userID)
	if appErr != nil {
		return appErr
	}
	if role != "owner" {
		return pkg.ErrForbidden.WithMessage("only workspace owners can delete documents")
	}

	return s.docRepo.Delete(ctx, docID)
}

// ListRecent returns the N most recently updated documents across all user's workspaces.
func (s *DocumentService) ListRecent(ctx context.Context, userID uuid.UUID, limit int) (*dto.RecentDocumentResp, *pkg.AppError) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	rows, appErr := s.docRepo.FindRecent(ctx, userID, limit)
	if appErr != nil {
		return nil, appErr
	}

	items := make([]dto.RecentDocumentItem, 0, len(rows))
	for _, row := range rows {
		var projectID *string
		if row.ProjectID != nil {
			pid := row.ProjectID.String()
			projectID = &pid
		}
		items = append(items, dto.RecentDocumentItem{
			ID:            row.ID.String(),
			Title:         row.Title,
			DiagramType:   row.DiagramType,
			WorkspaceID:   row.WorkspaceID.String(),
			WorkspaceName: row.WorkspaceName,
			ProjectID:     projectID,
			ProjectName:   row.ProjectName,
			UpdatedAt:     row.UpdatedAt,
		})
	}

	return &dto.RecentDocumentResp{Data: items}, nil
}

// findProjectForAuth finds a project and checks user membership in its workspace.
func (s *DocumentService) findProjectForAuth(ctx context.Context, projectID, userID uuid.UUID) (*model.Project, *pkg.AppError) {
	proj, appErr := s.projRepo.FindByID(ctx, projectID)
	if appErr != nil {
		return nil, appErr
	}
	// Verify user is a member of the project's workspace
	if _, appErr := s.wsSvc.RequireMembership(ctx, proj.WorkspaceID, userID); appErr != nil {
		return nil, appErr
	}
	return proj, nil
}

func toDocumentResp(d *model.Document) *dto.DocumentResp {
	var projectID *string
	if d.ProjectID != nil {
		s := d.ProjectID.String()
		projectID = &s
	}
	var createdBy *string
	if d.CreatedBy != nil {
		s := d.CreatedBy.String()
		createdBy = &s
	}
	return &dto.DocumentResp{
		ID:          d.ID.String(),
		ProjectID:   projectID,
		WorkspaceID: d.WorkspaceID.String(),
		Title:       d.Title,
		DiagramType: d.DiagramType,
		Content:     d.Content,
		View:        d.View,
		Version:     d.Version,
		CreatedBy:   createdBy,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
}

func toDocumentListItem(d *model.Document) dto.DocumentListItem {
	var projectID *string
	if d.ProjectID != nil {
		s := d.ProjectID.String()
		projectID = &s
	}
	var createdBy *string
	if d.CreatedBy != nil {
		s := d.CreatedBy.String()
		createdBy = &s
	}
	return dto.DocumentListItem{
		ID:          d.ID.String(),
		ProjectID:   projectID,
		WorkspaceID: d.WorkspaceID.String(),
		Title:       d.Title,
		DiagramType: d.DiagramType,
		Version:     d.Version,
		CreatedBy:   createdBy,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
}
