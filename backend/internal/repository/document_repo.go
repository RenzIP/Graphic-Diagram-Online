package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// DocumentRepo handles documents collection operations.
type DocumentRepo struct {
	col       *mongo.Collection
	wsCol     *mongo.Collection
	projCol   *mongo.Collection
	memberCol *mongo.Collection
}

// NewDocumentRepo creates a new DocumentRepo.
func NewDocumentRepo(db *mongo.Database) *DocumentRepo {
	return &DocumentRepo{
		col:       db.Collection("documents"),
		wsCol:     db.Collection("workspaces"),
		projCol:   db.Collection("projects"),
		memberCol: db.Collection("workspace_members"),
	}
}

// FindByProject returns paginated documents in a project.
func (r *DocumentRepo) FindByProject(ctx context.Context, projectID uuid.UUID, limit, offset int, diagramType, sortBy, sortOrder string) ([]model.Document, int, *pkg.AppError) {
	filter := bson.M{"project_id": projectID}

	if diagramType != "" {
		filter["diagram_type"] = diagramType
	}

	// Validate sort fields
	switch sortBy {
	case "created_at":
		sortBy = "created_at"
	case "title":
		sortBy = "title"
	default:
		sortBy = "updated_at"
	}
	sortDirection := -1 // desc
	if sortOrder == "asc" {
		sortDirection = 1
	}

	// Count total
	total, err := r.col.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list documents").WithDetails(err.Error())
	}

	// Fetch with pagination
	opts := options.Find().
		SetSort(bson.D{{Key: sortBy, Value: sortDirection}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list documents").WithDetails(err.Error())
	}
	defer cursor.Close(ctx)

	var docs []model.Document
	if err := cursor.All(ctx, &docs); err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to decode documents").WithDetails(err.Error())
	}

	return docs, int(total), nil
}

// FindByID returns a document by ID (full content/view).
func (r *DocumentRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Document, *pkg.AppError) {
	doc := new(model.Document)
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(doc)
	if appErr := handleMongoError(err, "document"); appErr != nil {
		return nil, appErr
	}
	return doc, nil
}

// Insert creates a new document.
func (r *DocumentRepo) Insert(ctx context.Context, doc *model.Document) *pkg.AppError {
	_, err := r.col.InsertOne(ctx, doc)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create document").WithDetails(err.Error())
	}
	return nil
}

// Update updates document fields.
func (r *DocumentRepo) Update(ctx context.Context, doc *model.Document) *pkg.AppError {
	filter := bson.M{"_id": doc.ID}
	update := bson.M{"$set": doc}
	_, err := r.col.UpdateOne(ctx, filter, update)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to update document").WithDetails(err.Error())
	}
	return nil
}

// Delete removes a document by ID.
func (r *DocumentRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete document").WithDetails(err.Error())
	}
	return nil
}

// FindRecent returns the N most recently updated documents across workspaces the user belongs to.
// Replaces the SQL JOIN query with a multi-step approach.
func (r *DocumentRepo) FindRecent(ctx context.Context, userID uuid.UUID, limit int) ([]RecentDocumentRow, *pkg.AppError) {
	// Step 1: Get workspace IDs for this user
	memberCursor, err := r.memberCol.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to fetch recent documents").WithDetails(err.Error())
	}
	defer memberCursor.Close(ctx)

	var members []model.WorkspaceMember
	if err := memberCursor.All(ctx, &members); err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to decode members").WithDetails(err.Error())
	}

	wsIDs := make([]uuid.UUID, len(members))
	for i, m := range members {
		wsIDs[i] = m.WorkspaceID
	}
	if len(wsIDs) == 0 {
		return []RecentDocumentRow{}, nil
	}

	// Step 2: Fetch recent documents from those workspaces
	docFilter := bson.M{"workspace_id": bson.M{"$in": wsIDs}}
	docOpts := options.Find().
		SetSort(bson.D{{Key: "updated_at", Value: -1}}).
		SetLimit(int64(limit))

	docCursor, err := r.col.Find(ctx, docFilter, docOpts)
	if err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to fetch recent documents").WithDetails(err.Error())
	}
	defer docCursor.Close(ctx)

	var docs []model.Document
	if err := docCursor.All(ctx, &docs); err != nil {
		return nil, pkg.ErrInternal.WithMessage("failed to decode documents").WithDetails(err.Error())
	}

	// Step 3: Build lookup maps for workspace and project names
	wsNameMap := make(map[uuid.UUID]string)
	for _, wsID := range wsIDs {
		ws := new(model.Workspace)
		if err := r.wsCol.FindOne(ctx, bson.M{"_id": wsID}).Decode(ws); err == nil {
			wsNameMap[wsID] = ws.Name
		}
	}

	projIDs := make([]uuid.UUID, 0)
	for _, d := range docs {
		if d.ProjectID != nil {
			projIDs = append(projIDs, *d.ProjectID)
		}
	}
	projNameMap := make(map[uuid.UUID]string)
	if len(projIDs) > 0 {
		projCursor, err := r.projCol.Find(ctx, bson.M{"_id": bson.M{"$in": projIDs}})
		if err == nil {
			defer projCursor.Close(ctx)
			var projs []model.Project
			if err := projCursor.All(ctx, &projs); err == nil {
				for _, p := range projs {
					projNameMap[p.ID] = p.Name
				}
			}
		}
	}

	// Step 4: Assemble result rows
	rows := make([]RecentDocumentRow, len(docs))
	for i, d := range docs {
		row := RecentDocumentRow{
			ID:            d.ID,
			Title:         d.Title,
			DiagramType:   d.DiagramType,
			WorkspaceID:   d.WorkspaceID,
			WorkspaceName: wsNameMap[d.WorkspaceID],
			ProjectID:     d.ProjectID,
			UpdatedAt:     d.UpdatedAt,
		}
		if d.ProjectID != nil {
			if name, ok := projNameMap[*d.ProjectID]; ok {
				row.ProjectName = &name
			}
		}
		rows[i] = row
	}

	return rows, nil
}

// RecentDocumentRow is the result from the recent documents query.
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
