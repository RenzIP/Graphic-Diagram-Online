package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"

	"github.com/renzip/GraDiOl/internal/model"
	"github.com/renzip/GraDiOl/internal/pkg"
)

// WorkspaceRepo handles workspaces and workspace_members table operations.
type WorkspaceRepo struct {
	db *bun.DB
}

// NewWorkspaceRepo creates a new WorkspaceRepo.
func NewWorkspaceRepo(db *bun.DB) *WorkspaceRepo {
	return &WorkspaceRepo{db: db}
}

// FindByMember returns paginated workspaces where the user is a member.
func (r *WorkspaceRepo) FindByMember(ctx context.Context, userID uuid.UUID, limit, offset int) ([]model.Workspace, int, *pkg.AppError) {
	var workspaces []model.Workspace

	subq := r.db.NewSelect().
		TableExpr("workspace_members AS wm").
		Column("wm.workspace_id").
		Where("wm.user_id = ?", userID)

	q := r.db.NewSelect().Model(&workspaces).
		Where("w.id IN (?)", subq).
		OrderExpr("w.updated_at DESC")

	total, err := applyPagination(q, limit, offset).ScanAndCount(ctx)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list workspaces").WithDetails(err.Error())
	}
	return workspaces, total, nil
}

// FindByID returns a workspace by ID.
func (r *WorkspaceRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Workspace, *pkg.AppError) {
	ws := new(model.Workspace)
	err := r.db.NewSelect().Model(ws).Where("w.id = ?", id).Scan(ctx)
	if appErr := handleQueryError(err, "workspace"); appErr != nil {
		return nil, appErr
	}
	return ws, nil
}

// FindBySlug returns a workspace by its URL slug.
func (r *WorkspaceRepo) FindBySlug(ctx context.Context, slug string) (*model.Workspace, *pkg.AppError) {
	ws := new(model.Workspace)
	err := r.db.NewSelect().Model(ws).Where("w.slug = ?", slug).Scan(ctx)
	if appErr := handleQueryError(err, "workspace"); appErr != nil {
		return nil, appErr
	}
	return ws, nil
}

// Insert creates a new workspace.
func (r *WorkspaceRepo) Insert(ctx context.Context, ws *model.Workspace) *pkg.AppError {
	_, err := r.db.NewInsert().Model(ws).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create workspace").WithDetails(err.Error())
	}
	return nil
}

// Update updates workspace fields.
func (r *WorkspaceRepo) Update(ctx context.Context, ws *model.Workspace) *pkg.AppError {
	_, err := r.db.NewUpdate().Model(ws).WherePK().Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to update workspace").WithDetails(err.Error())
	}
	return nil
}

// Delete removes a workspace by ID (CASCADE deletes projects/documents).
func (r *WorkspaceRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	_, err := r.db.NewDelete().Model((*model.Workspace)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete workspace").WithDetails(err.Error())
	}
	return nil
}

// --- WorkspaceMember operations ---

// InsertMember adds a member to a workspace.
func (r *WorkspaceRepo) InsertMember(ctx context.Context, m *model.WorkspaceMember) *pkg.AppError {
	_, err := r.db.NewInsert().Model(m).Exec(ctx)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to add workspace member").WithDetails(err.Error())
	}
	return nil
}

// GetMemberRole returns the role of a user in a workspace, or empty string if not a member.
func (r *WorkspaceRepo) GetMemberRole(ctx context.Context, workspaceID, userID uuid.UUID) (string, *pkg.AppError) {
	member := new(model.WorkspaceMember)
	err := r.db.NewSelect().Model(member).
		Where("wm.workspace_id = ?", workspaceID).
		Where("wm.user_id = ?", userID).
		Scan(ctx)
	if appErr := handleQueryError(err, "membership"); appErr != nil {
		if appErr.Code == "NOT_FOUND" {
			return "", nil // not a member — no error, just empty role
		}
		return "", appErr
	}
	return member.Role, nil
}

// CountMembers returns the number of members in a workspace.
func (r *WorkspaceRepo) CountMembers(ctx context.Context, workspaceID uuid.UUID) (int, *pkg.AppError) {
	count, err := r.db.NewSelect().
		Model((*model.WorkspaceMember)(nil)).
		Where("workspace_id = ?", workspaceID).
		Count(ctx)
	if err != nil {
		return 0, pkg.ErrInternal.WithMessage("failed to count members").WithDetails(err.Error())
	}
	return count, nil
}

// InsertWithOwner creates a workspace and its owner membership in a single transaction.
func (r *WorkspaceRepo) InsertWithOwner(ctx context.Context, ws *model.Workspace, member *model.WorkspaceMember) *pkg.AppError {
	err := runInTx(ctx, r.db, func(tx bun.Tx) error {
		if _, err := tx.NewInsert().Model(ws).Exec(ctx); err != nil {
			return err
		}
		if _, err := tx.NewInsert().Model(member).Exec(ctx); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create workspace with owner").WithDetails(err.Error())
	}
	return nil
}
