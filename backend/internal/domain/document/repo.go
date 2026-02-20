package document

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Repository struct {
	db *mongo.Database
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{db: db}
}

// ─── Workspaces ──────────────────────────────────────────────────────

func (r *Repository) ListWorkspaces(ctx context.Context) ([]Workspace, error) {
	col := r.db.Collection("workspaces")
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := col.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var workspaces []Workspace
	if err := cursor.All(ctx, &workspaces); err != nil {
		return nil, err
	}
	return workspaces, nil
}

func (r *Repository) CreateWorkspace(ctx context.Context, w *Workspace) error {
	col := r.db.Collection("workspaces")
	w.CreatedAt = time.Now()
	result, err := col.InsertOne(ctx, w)
	if err != nil {
		return err
	}
	// Set the ID from the inserted result
	if oid, ok := result.InsertedID.(string); ok {
		w.ID = oid
	}
	return nil
}

func (r *Repository) UpdateWorkspace(ctx context.Context, id string, name string) (*Workspace, error) {
	col := r.db.Collection("workspaces")
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"name": name}}

	_, err := col.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	// Fetch updated document
	w := new(Workspace)
	if err := col.FindOne(ctx, filter).Decode(w); err != nil {
		return nil, err
	}
	return w, nil
}

func (r *Repository) DeleteWorkspace(ctx context.Context, id string) error {
	col := r.db.Collection("workspaces")
	_, err := col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// ─── Projects ────────────────────────────────────────────────────────

func (r *Repository) ListProjectsByWorkspace(ctx context.Context, workspaceID string) ([]Project, error) {
	col := r.db.Collection("projects")
	filter := bson.M{"workspace_id": workspaceID}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var projects []Project
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, err
	}
	return projects, nil
}

func (r *Repository) CreateProject(ctx context.Context, p *Project) error {
	col := r.db.Collection("projects")
	p.CreatedAt = time.Now()
	result, err := col.InsertOne(ctx, p)
	if err != nil {
		return err
	}
	if oid, ok := result.InsertedID.(string); ok {
		p.ID = oid
	}
	return nil
}

func (r *Repository) UpdateProject(ctx context.Context, id string, name string) (*Project, error) {
	col := r.db.Collection("projects")
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"name": name}}

	_, err := col.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	p := new(Project)
	if err := col.FindOne(ctx, filter).Decode(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (r *Repository) DeleteProject(ctx context.Context, id string) error {
	col := r.db.Collection("projects")
	_, err := col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// ─── Documents ───────────────────────────────────────────────────────

func (r *Repository) ListByProject(ctx context.Context, projectID string) ([]DocumentMeta, error) {
	col := r.db.Collection("documents")
	filter := bson.M{"project_id": projectID}
	opts := options.Find().SetSort(bson.D{{Key: "updated_at", Value: -1}})

	cursor, err := col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var docs []DocumentMeta
	if err := cursor.All(ctx, &docs); err != nil {
		return nil, err
	}
	return docs, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Document, error) {
	col := r.db.Collection("documents")
	doc := new(Document)
	err := col.FindOne(ctx, bson.M{"_id": id}).Decode(doc)
	if err != nil {
		return nil, fmt.Errorf("document not found: %w", err)
	}
	return doc, nil
}

func (r *Repository) Create(ctx context.Context, doc *Document) error {
	col := r.db.Collection("documents")
	doc.CreatedAt = time.Now()
	doc.UpdatedAt = time.Now()
	result, err := col.InsertOne(ctx, doc)
	if err != nil {
		return err
	}
	if oid, ok := result.InsertedID.(string); ok {
		doc.ID = oid
	}
	return nil
}

func (r *Repository) Update(ctx context.Context, doc *Document) error {
	col := r.db.Collection("documents")
	doc.UpdatedAt = time.Now()
	filter := bson.M{"_id": doc.ID}
	update := bson.M{"$set": doc}
	_, err := col.UpdateOne(ctx, filter, update)
	return err
}

func (r *Repository) UpdatePartial(ctx context.Context, id string, fields map[string]interface{}) (*Document, error) {
	col := r.db.Collection("documents")
	filter := bson.M{"_id": id}

	setFields := bson.M{}

	if title, ok := fields["title"].(string); ok {
		setFields["title"] = title
	}
	if content, ok := fields["content"]; ok {
		contentJSON, err := json.Marshal(content)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal content: %w", err)
		}
		setFields["content"] = json.RawMessage(contentJSON)
	}
	if view, ok := fields["view"]; ok {
		viewJSON, err := json.Marshal(view)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal view: %w", err)
		}
		setFields["view"] = json.RawMessage(viewJSON)
	}
	if diagramType, ok := fields["diagram_type"].(string); ok {
		setFields["diagram_type"] = diagramType
	}

	setFields["updated_at"] = time.Now()

	update := bson.M{
		"$set": setFields,
		"$inc": bson.M{"version": 1},
	}

	_, err := col.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	// Fetch updated document
	doc := new(Document)
	if err := col.FindOne(ctx, filter).Decode(doc); err != nil {
		return nil, err
	}
	return doc, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	col := r.db.Collection("documents")
	_, err := col.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
