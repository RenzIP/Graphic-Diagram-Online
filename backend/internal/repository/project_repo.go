package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// ProjectRepo handles projects table operations.
type ProjectRepo struct {
	db *bun.DB
}

// NewProjectRepo creates a new ProjectRepo.
func NewProjectRepo(db *bun.DB) *ProjectRepo {
	return &ProjectRepo{db: db}
}

// FindByWorkspace returns paginated projects in a workspace.
func (r *ProjectRepo) FindByWorkspace(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]model.Project, int, *pkg.AppError) {
	var projects []model.Project

	q := r.db.NewSelect().Model(&projects).
		Where("p.workspace_id = ?", workspaceID).
		OrderExpr("p.updated_at DESC")

	total, err := applyPagination(q, limit, offset).ScanAndCount(ctx)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list projects").WithDetails(err.Error())
	}
	return projects, total, nil
}

// FindByID returns a project by ID.
func (r *ProjectRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Project, *pkg.AppError) {
	proj := new(model.Project)
	err := r.db.NewSelect().Model(proj).Where("p.id = ?", id).Scan(ctx)
	if appErr := handleQueryError(err, "project"); appErr != nil {
		return nil, appErr
	}
	return proj, nil
}

// Insert creates a new project.
func (r *ProjectRepo) Insert(ctx context.Context, proj *model.Project) *pkg.AppError {
	_, err := r.db.NewInsert().Model(proj).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create project").WithDetails(err.Error())
	}
	return nil
}

// Update updates project fields.
func (r *ProjectRepo) Update(ctx context.Context, proj *model.Project) *pkg.AppError {
	_, err := r.db.NewUpdate().Model(proj).WherePK().Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to update project").WithDetails(err.Error())
	}
	return nil
}

// Delete removes a project by ID (CASCADE deletes documents).
func (r *ProjectRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	_, err := r.db.NewDelete().Model((*model.Project)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete project").WithDetails(err.Error())
	}
	return nil
}

// CountDocuments returns the number of documents in a project.
func (r *ProjectRepo) CountDocuments(ctx context.Context, projectID uuid.UUID) (int, *pkg.AppError) {
	count, err := r.db.NewSelect().
		Model((*model.Document)(nil)).
		Where("project_id = ?", projectID).
		Count(ctx)
	if err != nil {
		return 0, pkg.ErrInternal.WithMessage("failed to count documents").WithDetails(err.Error())
	}
	return count, nil
}
