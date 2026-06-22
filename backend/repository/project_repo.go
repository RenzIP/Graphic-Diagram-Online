package repository

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/RenzIP/Graphic-Diagram-Online/model"
	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
)

type ProjectRepo struct {
	db *gorm.DB
}

func NewProjectRepo(db *gorm.DB) *ProjectRepo {
	return &ProjectRepo{db: db}
}

func (r *ProjectRepo) FindByWorkspace(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]model.Project, int, *pkg.AppError) {
	query := r.db.WithContext(ctx).Model(&model.Project{}).Where("workspace_id = ?", workspaceID)

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list projects").WithDetails(err.Error())
	}

	var projects []model.Project
	err := query.
		Order("updated_at desc").
		Limit(limit).
		Offset(offset).
		Find(&projects).Error
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list projects").WithDetails(err.Error())
	}

	return projects, int(total), nil
}

func (r *ProjectRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Project, *pkg.AppError) {
	proj := new(model.Project)
	err := r.db.WithContext(ctx).First(proj, "id = ?", id).Error
	if appErr := handleGormError(err, "project"); appErr != nil {
		return nil, appErr
	}
	return proj, nil
}

func (r *ProjectRepo) Insert(ctx context.Context, proj *model.Project) *pkg.AppError {
	if err := r.db.WithContext(ctx).Create(proj).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to create project").WithDetails(err.Error())
	}
	return nil
}

func (r *ProjectRepo) Update(ctx context.Context, proj *model.Project) *pkg.AppError {
	if err := r.db.WithContext(ctx).Save(proj).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to update project").WithDetails(err.Error())
	}
	return nil
}

func (r *ProjectRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	if err := r.db.WithContext(ctx).Delete(&model.Project{}, "id = ?", id).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete project").WithDetails(err.Error())
	}
	return nil
}

func (r *ProjectRepo) CountDocuments(ctx context.Context, projectID uuid.UUID) (int, *pkg.AppError) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.Document{}).
		Where("project_id = ?", projectID).
		Count(&count).Error
	if err != nil {
		return 0, pkg.ErrInternal.WithMessage("failed to count documents").WithDetails(err.Error())
	}
	return int(count), nil
}
