package document

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/uptrace/bun"
)

type Repository struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) *Repository {
	return &Repository{db: db}
}

// ─── Workspaces ──────────────────────────────────────────────────────

func (r *Repository) ListWorkspaces(ctx context.Context) ([]Workspace, error) {
	var workspaces []Workspace
	err := r.db.NewSelect().Model(&workspaces).OrderExpr("created_at DESC").Scan(ctx)
	return workspaces, err
}

func (r *Repository) CreateWorkspace(ctx context.Context, w *Workspace) error {
	_, err := r.db.NewInsert().Model(w).Returning("*").Exec(ctx)
	return err
}

func (r *Repository) UpdateWorkspace(ctx context.Context, id string, name string) (*Workspace, error) {
	w := &Workspace{ID: id}
	_, err := r.db.NewUpdate().
		Model(w).
		Set("name = ?", name).
		Where("id = ?", id).
		Returning("*").
		Exec(ctx)
	if err != nil {
		return nil, err
	}
	return w, nil
}

func (r *Repository) DeleteWorkspace(ctx context.Context, id string) error {
	_, err := r.db.NewDelete().Model((*Workspace)(nil)).Where("id = ?", id).Exec(ctx)
	return err
}

// ─── Projects ────────────────────────────────────────────────────────

func (r *Repository) ListProjectsByWorkspace(ctx context.Context, workspaceID string) ([]Project, error) {
	var projects []Project
	err := r.db.NewSelect().
		Model(&projects).
		Where("workspace_id = ?", workspaceID).
		OrderExpr("created_at DESC").
		Scan(ctx)
	return projects, err
}

func (r *Repository) CreateProject(ctx context.Context, p *Project) error {
	_, err := r.db.NewInsert().Model(p).Returning("*").Exec(ctx)
	return err
}

func (r *Repository) UpdateProject(ctx context.Context, id string, name string) (*Project, error) {
	p := &Project{ID: id}
	_, err := r.db.NewUpdate().
		Model(p).
		Set("name = ?", name).
		Where("id = ?", id).
		Returning("*").
		Exec(ctx)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *Repository) DeleteProject(ctx context.Context, id string) error {
	_, err := r.db.NewDelete().Model((*Project)(nil)).Where("id = ?", id).Exec(ctx)
	return err
}

// ─── Documents ───────────────────────────────────────────────────────

func (r *Repository) ListByProject(ctx context.Context, projectID string) ([]DocumentMeta, error) {
	var docs []DocumentMeta
	err := r.db.NewSelect().
		Model(&docs).
		Where("project_id = ?", projectID).
		OrderExpr("updated_at DESC").
		Scan(ctx)
	return docs, err
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Document, error) {
	doc := new(Document)
	err := r.db.NewSelect().Model(doc).Where("d.id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("document not found: %w", err)
	}
	return doc, nil
}

func (r *Repository) Create(ctx context.Context, doc *Document) error {
	_, err := r.db.NewInsert().Model(doc).Returning("*").Exec(ctx)
	return err
}

func (r *Repository) Update(ctx context.Context, doc *Document) error {
	doc.UpdatedAt = time.Now()
	_, err := r.db.NewUpdate().Model(doc).WherePK().Returning("*").Exec(ctx)
	return err
}

func (r *Repository) UpdatePartial(ctx context.Context, id string, fields map[string]interface{}) (*Document, error) {
	doc := &Document{ID: id}
	q := r.db.NewUpdate().Model(doc).Where("id = ?", id)

	if title, ok := fields["title"].(string); ok {
		q = q.Set("title = ?", title)
	}
	if content, ok := fields["content"]; ok {
		contentJSON, err := json.Marshal(content)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal content: %w", err)
		}
		q = q.Set("content = ?", string(contentJSON))
	}
	if view, ok := fields["view"]; ok {
		viewJSON, err := json.Marshal(view)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal view: %w", err)
		}
		q = q.Set("view = ?", string(viewJSON))
	}
	if diagramType, ok := fields["diagram_type"].(string); ok {
		q = q.Set("diagram_type = ?", diagramType)
	}

	q = q.Set("updated_at = ?", time.Now())
	q = q.Set("version = version + 1")
	q = q.Returning("*")

	_, err := q.Exec(ctx)
	if err != nil {
		return nil, err
	}
	return doc, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.db.NewDelete().Model((*Document)(nil)).Where("id = ?", id).Exec(ctx)
	return err
}
