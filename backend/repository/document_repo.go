package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/RenzIP/Graphic-Diagram-Online/model"
	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
)

type DocumentRepo struct {
	db *gorm.DB
}

func NewDocumentRepo(db *gorm.DB) *DocumentRepo {
	return &DocumentRepo{db: db}
}

func (r *DocumentRepo) FindByProject(ctx context.Context, projectID uuid.UUID, limit, offset int, diagramType, sortBy, sortOrder string) ([]model.Document, int, *pkg.AppError) {
	sortColumn := "updated_at"
	switch sortBy {
	case "created_at":
		sortColumn = "created_at"
	case "title":
		sortColumn = "title"
	}
	sortDirection := "desc"
	if sortOrder == "asc" {
		sortDirection = "asc"
	}

	query := r.db.WithContext(ctx).Model(&model.Document{}).Where("project_id = ?", projectID)
	if diagramType != "" {
		query = query.Where("diagram_type = ?", diagramType)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list documents").WithDetails(err.Error())
	}

	var docs []model.Document
	err := query.
		Order(sortColumn + " " + sortDirection).
		Limit(limit).
		Offset(offset).
		Find(&docs).Error
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list documents").WithDetails(err.Error())
	}

	return docs, int(total), nil
}

func (r *DocumentRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Document, *pkg.AppError) {
	doc := new(model.Document)
	err := r.db.WithContext(ctx).First(doc, "id = ?", id).Error
	if appErr := handleGormError(err, "document"); appErr != nil {
		return nil, appErr
	}
	return doc, nil
}

func (r *DocumentRepo) Insert(ctx context.Context, doc *model.Document) *pkg.AppError {
	if err := r.db.WithContext(ctx).Create(doc).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to create document").WithDetails(err.Error())
	}
	return nil
}

func (r *DocumentRepo) Update(ctx context.Context, doc *model.Document) *pkg.AppError {
	if err := r.db.WithContext(ctx).Save(doc).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to update document").WithDetails(err.Error())
	}
	return nil
}

func (r *DocumentRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	if err := r.db.WithContext(ctx).Delete(&model.Document{}, "id = ?", id).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete document").WithDetails(err.Error())
	}
	return nil
}

func (r *DocumentRepo) FindRecent(ctx context.Context, userID uuid.UUID, limit int) ([]RecentDocumentRow, *pkg.AppError) {
	var recent []RecentDocumentRow
	err := r.db.WithContext(ctx).Raw(`
		select d.id, d.title, d.diagram_type, d.workspace_id, w.name as workspace_name,
			d.project_id, p.name as project_name, d.updated_at
		from documents d
		join workspace_members wm on wm.workspace_id = d.workspace_id
		join workspaces w on w.id = d.workspace_id
		left join projects p on p.id = d.project_id
		where wm.user_id = ?
		order by d.updated_at desc
		limit ?
	`, userID, limit).Scan(&recent).Error
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to fetch recent documents").WithDetails(err.Error())
	}
	return recent, nil
}

type RecentDocumentRow struct {
	ID            uuid.UUID  `json:"id"`
	Title         string     `json:"title"`
	DiagramType   string     `json:"diagram_type"`
	WorkspaceID   uuid.UUID  `json:"workspace_id"`
	WorkspaceName string     `json:"workspace_name"`
	ProjectID     *uuid.UUID `json:"project_id"`
	ProjectName   *string    `json:"project_name"`
	UpdatedAt     time.Time  `json:"updated_at"`
}
