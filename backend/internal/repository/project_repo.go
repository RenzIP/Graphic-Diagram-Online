package repository

import (
	"context"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// ProjectRepo handles projects collection operations.
type ProjectRepo struct {
	col    *mongo.Collection
	docCol *mongo.Collection
}

// NewProjectRepo creates a new ProjectRepo.
func NewProjectRepo(db *mongo.Database) *ProjectRepo {
	return &ProjectRepo{
		col:    db.Collection("projects"),
		docCol: db.Collection("documents"),
	}
}

// FindByWorkspace returns paginated projects in a workspace.
func (r *ProjectRepo) FindByWorkspace(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]model.Project, int, *pkg.AppError) {
	filter := bson.M{"workspace_id": workspaceID}

	// Count total
	total, err := r.col.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list projects").WithDetails(err.Error())
	}

	// Fetch with pagination and sort
	opts := options.Find().
		SetSort(bson.D{{Key: "updated_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list projects").WithDetails(err.Error())
	}
	defer cursor.Close(ctx)

	var projects []model.Project
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to decode projects").WithDetails(err.Error())
	}

	return projects, int(total), nil
}

// FindByID returns a project by ID.
func (r *ProjectRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Project, *pkg.AppError) {
	proj := new(model.Project)
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(proj)
	if appErr := handleMongoError(err, "project"); appErr != nil {
		return nil, appErr
	}
	return proj, nil
}

// Insert creates a new project.
func (r *ProjectRepo) Insert(ctx context.Context, proj *model.Project) *pkg.AppError {
	_, err := r.col.InsertOne(ctx, proj)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create project").WithDetails(err.Error())
	}
	return nil
}

// Update updates project fields.
func (r *ProjectRepo) Update(ctx context.Context, proj *model.Project) *pkg.AppError {
	filter := bson.M{"_id": proj.ID}
	update := bson.M{"$set": proj}
	_, err := r.col.UpdateOne(ctx, filter, update)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to update project").WithDetails(err.Error())
	}
	return nil
}

// Delete removes a project by ID.
func (r *ProjectRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	_, err := r.col.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete project").WithDetails(err.Error())
	}
	return nil
}

// CountDocuments returns the number of documents in a project.
func (r *ProjectRepo) CountDocuments(ctx context.Context, projectID uuid.UUID) (int, *pkg.AppError) {
	count, err := r.docCol.CountDocuments(ctx, bson.M{"project_id": projectID})
	if err != nil {
		return 0, pkg.ErrInternal.WithMessage("failed to count documents").WithDetails(err.Error())
	}
	return int(count), nil
}
