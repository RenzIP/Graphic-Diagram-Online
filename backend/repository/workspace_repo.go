package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/RenzIP/Graphic-Diagram-Online/model"
	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
)

type WorkspaceRepo struct {
	db *gorm.DB
}

func NewWorkspaceRepo(db *gorm.DB) *WorkspaceRepo {
	return &WorkspaceRepo{db: db}
}

func (r *WorkspaceRepo) FindByMember(ctx context.Context, userID uuid.UUID, limit, offset int) ([]model.Workspace, int, *pkg.AppError) {
	db := r.db.WithContext(ctx).
		Table("workspaces w").
		Joins("join workspace_members wm on wm.workspace_id = w.id").
		Where("wm.user_id = ?", userID)

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to count workspaces").WithDetails(err.Error())
	}

	var workspaces []model.Workspace
	err := db.
		Select("w.id, w.name, w.slug, w.owner_id, w.description, w.created_at, w.updated_at").
		Order("w.updated_at desc").
		Limit(limit).
		Offset(offset).
		Scan(&workspaces).Error
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list workspaces").WithDetails(err.Error())
	}

	return workspaces, int(total), nil
}

func (r *WorkspaceRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Workspace, *pkg.AppError) {
	ws := new(model.Workspace)
	err := r.db.WithContext(ctx).First(ws, "id = ?", id).Error
	if appErr := handleGormError(err, "workspace"); appErr != nil {
		return nil, appErr
	}
	return ws, nil
}

func (r *WorkspaceRepo) FindBySlug(ctx context.Context, slug string) (*model.Workspace, *pkg.AppError) {
	ws := new(model.Workspace)
	err := r.db.WithContext(ctx).First(ws, "slug = ?", slug).Error
	if appErr := handleGormError(err, "workspace"); appErr != nil {
		return nil, appErr
	}
	return ws, nil
}

func (r *WorkspaceRepo) Insert(ctx context.Context, ws *model.Workspace) *pkg.AppError {
	if err := r.db.WithContext(ctx).Create(ws).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to create workspace").WithDetails(err.Error())
	}
	return nil
}

func (r *WorkspaceRepo) Update(ctx context.Context, ws *model.Workspace) *pkg.AppError {
	if err := r.db.WithContext(ctx).Save(ws).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to update workspace").WithDetails(err.Error())
	}
	return nil
}

func (r *WorkspaceRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	if err := r.db.WithContext(ctx).Delete(&model.Workspace{}, "id = ?", id).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete workspace").WithDetails(err.Error())
	}
	return nil
}

func (r *WorkspaceRepo) InsertMember(ctx context.Context, m *model.WorkspaceMember) *pkg.AppError {
	if err := r.db.WithContext(ctx).Create(m).Error; err != nil {
		return pkg.ErrInternal.WithMessage("failed to add workspace member").WithDetails(err.Error())
	}
	return nil
}

func (r *WorkspaceRepo) GetMemberRole(ctx context.Context, workspaceID, userID uuid.UUID) (string, *pkg.AppError) {
	var member model.WorkspaceMember
	err := r.db.WithContext(ctx).
		First(&member, "workspace_id = ? and user_id = ?", workspaceID, userID).
		Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", nil
	}
	if err != nil {
		return "", pkg.ErrInternal.WithMessage("failed to fetch membership").WithDetails(err.Error())
	}
	return member.Role, nil
}

func (r *WorkspaceRepo) CountMembers(ctx context.Context, workspaceID uuid.UUID) (int, *pkg.AppError) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.WorkspaceMember{}).
		Where("workspace_id = ?", workspaceID).
		Count(&count).Error
	if err != nil {
		return 0, pkg.ErrInternal.WithMessage("failed to count members").WithDetails(err.Error())
	}
	return int(count), nil
}

func (r *WorkspaceRepo) InsertWithOwner(ctx context.Context, ws *model.Workspace, member *model.WorkspaceMember) *pkg.AppError {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(ws).Error; err != nil {
			return err
		}
		return tx.Create(member).Error
	})
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create workspace with owner").WithDetails(err.Error())
	}
	return nil
}
