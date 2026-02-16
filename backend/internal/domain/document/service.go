package document

import (
	"context"
	"encoding/json"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// ─── Workspaces ──────────────────────────────────────────────────────

func (s *Service) ListWorkspaces(ctx context.Context) ([]Workspace, error) {
	return s.repo.ListWorkspaces(ctx)
}

func (s *Service) CreateWorkspace(ctx context.Context, req CreateWorkspaceRequest) (*Workspace, error) {
	w := &Workspace{
		Name:        req.Name,
		MemberCount: 1,
	}
	if err := s.repo.CreateWorkspace(ctx, w); err != nil {
		return nil, err
	}
	return w, nil
}

func (s *Service) UpdateWorkspace(ctx context.Context, id string, req CreateWorkspaceRequest) (*Workspace, error) {
	return s.repo.UpdateWorkspace(ctx, id, req.Name)
}

func (s *Service) DeleteWorkspace(ctx context.Context, id string) error {
	return s.repo.DeleteWorkspace(ctx, id)
}

// ─── Projects ────────────────────────────────────────────────────────

func (s *Service) ListProjectsByWorkspace(ctx context.Context, workspaceID string) ([]Project, error) {
	return s.repo.ListProjectsByWorkspace(ctx, workspaceID)
}

func (s *Service) CreateProject(ctx context.Context, req CreateProjectRequest) (*Project, error) {
	p := &Project{
		WorkspaceID: req.WorkspaceID,
		Name:        req.Name,
	}
	if err := s.repo.CreateProject(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *Service) UpdateProject(ctx context.Context, id string, req CreateProjectRequest) (*Project, error) {
	return s.repo.UpdateProject(ctx, id, req.Name)
}

func (s *Service) DeleteProject(ctx context.Context, id string) error {
	return s.repo.DeleteProject(ctx, id)
}

// ─── Documents ───────────────────────────────────────────────────────

func (s *Service) ListByProject(ctx context.Context, projectID string) ([]DocumentMeta, error) {
	return s.repo.ListByProject(ctx, projectID)
}

func (s *Service) GetByID(ctx context.Context, id string) (*Document, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, req CreateDocumentRequest) (*Document, error) {
	// Default content if not provided
	content := &DocumentContent{
		Nodes: []Node{},
		Edges: []Edge{},
	}
	if req.Content != nil {
		content = req.Content
	}

	contentJSON, err := json.Marshal(content)
	if err != nil {
		return nil, err
	}

	// Default view
	view := &DocumentView{
		Positions: make(map[string]Position),
		Styles:    make(map[string]map[string]interface{}),
		Routing:   make(map[string]interface{}),
	}
	viewJSON, err := json.Marshal(view)
	if err != nil {
		return nil, err
	}

	doc := &Document{
		ProjectID:   req.ProjectID,
		Title:       req.Title,
		DiagramType: req.DiagramType,
		Content:     contentJSON,
		View:        viewJSON,
		Version:     1,
	}

	if doc.Title == "" {
		doc.Title = "Untitled"
	}
	if doc.DiagramType == "" {
		doc.DiagramType = "flowchart"
	}

	if err := s.repo.Create(ctx, doc); err != nil {
		return nil, err
	}
	return doc, nil
}

func (s *Service) Update(ctx context.Context, id string, fields map[string]interface{}) (*Document, error) {
	return s.repo.UpdatePartial(ctx, id, fields)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
