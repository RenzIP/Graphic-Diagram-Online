package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// DocumentRepo handles documents table operations.
type DocumentRepo struct {
	db *bun.DB
}

// NewDocumentRepo creates a new DocumentRepo.
func NewDocumentRepo(db *bun.DB) *DocumentRepo {
	return &DocumentRepo{db: db}
}

// FindByProject returns paginated documents in a project.
func (r *DocumentRepo) FindByProject(ctx context.Context, projectID uuid.UUID, limit, offset int, diagramType, sortBy, sortOrder string) ([]model.Document, int, *pkg.AppError) {
	var docs []model.Document

	q := r.db.NewSelect().Model(&docs).
		Where("d.project_id = ?", projectID)

	if diagramType != "" {
		q = q.Where("d.diagram_type = ?", diagramType)
	}

	// Validate sort fields to prevent SQL injection
	switch sortBy {
	case "created_at":
		sortBy = "d.created_at"
	case "title":
		sortBy = "d.title"
	default:
		sortBy = "d.updated_at"
	}
	if sortOrder != "asc" {
		sortOrder = "desc"
	}
	q = q.OrderExpr(sortBy + " " + sortOrder)

	total, err := applyPagination(q, limit, offset).ScanAndCount(ctx)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list documents").WithDetails(err.Error())
	}
	return docs, total, nil
}

// FindByID returns a document by ID (full content/view).
func (r *DocumentRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Document, *pkg.AppError) {
	doc := new(model.Document)
	err := r.db.NewSelect().Model(doc).Where("d.id = ?", id).Scan(ctx)
	if appErr := handleQueryError(err, "document"); appErr != nil {
		return nil, appErr
	}
	return doc, nil
}

// Insert creates a new document.
func (r *DocumentRepo) Insert(ctx context.Context, doc *model.Document) *pkg.AppError {
	_, err := r.db.NewInsert().Model(doc).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create document").WithDetails(err.Error())
	}
	return nil
}

// Update updates document fields.
func (r *DocumentRepo) Update(ctx context.Context, doc *model.Document) *pkg.AppError {
	_, err := r.db.NewUpdate().Model(doc).WherePK().Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to update document").WithDetails(err.Error())
	}
	return nil
}

// Delete removes a document by ID.
func (r *DocumentRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	_, err := r.db.NewDelete().Model((*model.Document)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete document").WithDetails(err.Error())
	}
	return nil
}

// FindRecent returns the N most recently updated documents across workspaces the user belongs to.
// Joins workspace and project to provide names for the dashboard widget.
func (r *DocumentRepo) FindRecent(ctx context.Context, userID uuid.UUID, limit int) ([]RecentDocumentRow, *pkg.AppError) {
	var rows []RecentDocumentRow

	err := r.db.NewSelect().
		TableExpr("documents AS d").
		Join("JOIN workspaces AS w ON w.id = d.workspace_id").
		Join("LEFT JOIN projects AS p ON p.id = d.project_id").
		Join("JOIN workspace_members AS wm ON wm.workspace_id = d.workspace_id").
		ColumnExpr("d.id, d.title, d.diagram_type, d.workspace_id, w.name AS workspace_name").
		ColumnExpr("d.project_id, p.name AS project_name, d.updated_at").
		Where("wm.user_id = ?", userID).
		OrderExpr("d.updated_at DESC").
		Limit(limit).
		Scan(ctx, &rows)
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to fetch recent documents").WithDetails(err.Error())
	}
	return rows, nil
}

// RecentDocumentRow is the raw row from the recent documents query.
type RecentDocumentRow struct {
	ID            uuid.UUID  `bun:"id"`
	Title         string     `bun:"title"`
	DiagramType   string     `bun:"diagram_type"`
	WorkspaceID   uuid.UUID  `bun:"workspace_id"`
	WorkspaceName string     `bun:"workspace_name"`
	ProjectID     *uuid.UUID `bun:"project_id"`
	ProjectName   *string    `bun:"project_name"`
	UpdatedAt     time.Time  `bun:"updated_at"`
}
