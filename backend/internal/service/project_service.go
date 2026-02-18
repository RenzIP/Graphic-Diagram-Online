package service

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/renzip/GraDiOl/internal/dto"
	"github.com/renzip/GraDiOl/internal/model"
	"github.com/renzip/GraDiOl/internal/pkg"
	"github.com/renzip/GraDiOl/internal/repository"
)

// ProjectService handles project business logic with authorization.
type ProjectService struct {
	projectRepo *repository.ProjectRepo
	wsSvc       *WorkspaceService
}

// NewProjectService creates a new ProjectService.
func NewProjectService(projectRepo *repository.ProjectRepo, wsSvc *WorkspaceService) *ProjectService {
	return &ProjectService{projectRepo: projectRepo, wsSvc: wsSvc}
}

// ListByWorkspace returns paginated projects for a workspace. Requires membership.
func (s *ProjectService) ListByWorkspace(ctx context.Context, userID, workspaceID uuid.UUID, pq dto.PaginationQuery) (*dto.ProjectListResp, *pkg.AppError) {
	// Check membership (any role can list projects)
	if _, appErr := s.wsSvc.RequireMembership(ctx, workspaceID, userID); appErr != nil {
		return nil, appErr
	}

	projects, total, appErr := s.projectRepo.FindByWorkspace(ctx, workspaceID, pq.PerPage, pq.Offset())
	if appErr != nil {
		return nil, appErr
	}

	items := make([]dto.ProjectListItem, 0, len(projects))
	for _, p := range projects {
		docCount, countErr := s.projectRepo.CountDocuments(ctx, p.ID)
		if countErr != nil {
			return nil, countErr
		}

		items = append(items, toProjectListItem(&p, docCount))
	}

	meta := dto.NewPaginationMeta(pq, total)
	return &dto.ProjectListResp{Data: items, Meta: meta}, nil
}

// Create creates a new project. Requires editor or owner role in the workspace.
func (s *ProjectService) Create(ctx context.Context, userID uuid.UUID, req dto.CreateProjectReq) (*dto.ProjectResp, *pkg.AppError) {
	if appErr := pkg.Validate(req); appErr != nil {
		return nil, appErr
	}

	workspaceID, err := uuid.Parse(req.WorkspaceID)
	if err != nil {
		return nil, pkg.ErrBadRequest.WithMessage("invalid workspace_id")
	}

	// Require editor or owner
	role, appErr := s.wsSvc.RequireMembership(ctx, workspaceID, userID)
	if appErr != nil {
		return nil, appErr
	}
	if role == "viewer" {
		return nil, pkg.ErrForbidden.WithMessage("viewers cannot create projects")
	}

	proj := &model.Project{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   &userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if appErr := s.projectRepo.Insert(ctx, proj); appErr != nil {
		return nil, appErr
	}

	return toProjectResp(proj), nil
}

// Update modifies a project. Requires editor or owner role.
func (s *ProjectService) Update(ctx context.Context, userID, projectID uuid.UUID, req dto.UpdateProjectReq) (*dto.ProjectResp, *pkg.AppError) {
	proj, appErr := s.projectRepo.FindByID(ctx, projectID)
	if appErr != nil {
		return nil, appErr
	}

	role, appErr := s.wsSvc.RequireMembership(ctx, proj.WorkspaceID, userID)
	if appErr != nil {
		return nil, appErr
	}
	if role == "viewer" {
		return nil, pkg.ErrForbidden.WithMessage("viewers cannot update projects")
	}

	if req.Name != nil {
		proj.Name = *req.Name
	}
	if req.Description != nil {
		proj.Description = req.Description
	}
	proj.UpdatedAt = time.Now()

	if appErr := s.projectRepo.Update(ctx, proj); appErr != nil {
		return nil, appErr
	}

	return toProjectResp(proj), nil
}

// Delete removes a project. Owner role only.
func (s *ProjectService) Delete(ctx context.Context, userID, projectID uuid.UUID) *pkg.AppError {
	proj, appErr := s.projectRepo.FindByID(ctx, projectID)
	if appErr != nil {
		return appErr
	}

	role, appErr := s.wsSvc.RequireMembership(ctx, proj.WorkspaceID, userID)
	if appErr != nil {
		return appErr
	}
	if role != "owner" {
		return pkg.ErrForbidden.WithMessage("only workspace owners can delete projects")
	}

	return s.projectRepo.Delete(ctx, projectID)
}

func toProjectResp(p *model.Project) *dto.ProjectResp {
	var createdBy *string
	if p.CreatedBy != nil {
		s := p.CreatedBy.String()
		createdBy = &s
	}
	return &dto.ProjectResp{
		ID:          p.ID.String(),
		WorkspaceID: p.WorkspaceID.String(),
		Name:        p.Name,
		Description: p.Description,
		CreatedBy:   createdBy,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func toProjectListItem(p *model.Project, docCount int) dto.ProjectListItem {
	var createdBy *string
	if p.CreatedBy != nil {
		s := p.CreatedBy.String()
		createdBy = &s
	}
	return dto.ProjectListItem{
		ID:            p.ID.String(),
		WorkspaceID:   p.WorkspaceID.String(),
		Name:          p.Name,
		Description:   p.Description,
		DocumentCount: docCount,
		CreatedBy:     createdBy,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}
}
