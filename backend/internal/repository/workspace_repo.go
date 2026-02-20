package repository

import (
	"context"
	"log"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/model"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// WorkspaceRepo handles workspaces and workspace_members collection operations.
type WorkspaceRepo struct {
	db        *mongo.Database
	wsCol     *mongo.Collection
	memberCol *mongo.Collection
}

// NewWorkspaceRepo creates a new WorkspaceRepo.
func NewWorkspaceRepo(db *mongo.Database) *WorkspaceRepo {
	return &WorkspaceRepo{
		db:        db,
		wsCol:     db.Collection("workspaces"),
		memberCol: db.Collection("workspace_members"),
	}
}

// FindByMember returns paginated workspaces where the user is a member.
func (r *WorkspaceRepo) FindByMember(ctx context.Context, userID uuid.UUID, limit, offset int) ([]model.Workspace, int, *pkg.AppError) {
	// Step 1: Get workspace IDs where user is a member
	memberFilter := bson.M{"user_id": userID}
	cursor, err := r.memberCol.Find(ctx, memberFilter)
	if err != nil {
		log.Printf("[WorkspaceRepo.FindByMember] DB error: %v", err)
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list workspaces").WithDetails(err.Error())
	}
	defer cursor.Close(ctx)

	var members []model.WorkspaceMember
	if err := cursor.All(ctx, &members); err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to decode members").WithDetails(err.Error())
	}

	wsIDs := make([]uuid.UUID, len(members))
	for i, m := range members {
		wsIDs[i] = m.WorkspaceID
	}

	if len(wsIDs) == 0 {
		return []model.Workspace{}, 0, nil
	}

	// Step 2: Count total
	wsFilter := bson.M{"_id": bson.M{"$in": wsIDs}}
	total, err := r.wsCol.CountDocuments(ctx, wsFilter)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to count workspaces").WithDetails(err.Error())
	}

	// Step 3: Fetch with pagination
	opts := options.Find().
		SetSort(bson.D{{Key: "updated_at", Value: -1}}).
		SetLimit(int64(limit)).
		SetSkip(int64(offset))

	wsCursor, err := r.wsCol.Find(ctx, wsFilter, opts)
	if err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to list workspaces").WithDetails(err.Error())
	}
	defer wsCursor.Close(ctx)

	var workspaces []model.Workspace
	if err := wsCursor.All(ctx, &workspaces); err != nil {
		return nil, 0, pkg.ErrInternal.WithMessage("failed to decode workspaces").WithDetails(err.Error())
	}

	return workspaces, int(total), nil
}

// FindByID returns a workspace by ID.
func (r *WorkspaceRepo) FindByID(ctx context.Context, id uuid.UUID) (*model.Workspace, *pkg.AppError) {
	ws := new(model.Workspace)
	err := r.wsCol.FindOne(ctx, bson.M{"_id": id}).Decode(ws)
	if appErr := handleMongoError(err, "workspace"); appErr != nil {
		return nil, appErr
	}
	return ws, nil
}

// FindBySlug returns a workspace by its URL slug.
func (r *WorkspaceRepo) FindBySlug(ctx context.Context, slug string) (*model.Workspace, *pkg.AppError) {
	ws := new(model.Workspace)
	err := r.wsCol.FindOne(ctx, bson.M{"slug": slug}).Decode(ws)
	if appErr := handleMongoError(err, "workspace"); appErr != nil {
		return nil, appErr
	}
	return ws, nil
}

// Insert creates a new workspace.
func (r *WorkspaceRepo) Insert(ctx context.Context, ws *model.Workspace) *pkg.AppError {
	_, err := r.wsCol.InsertOne(ctx, ws)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to create workspace").WithDetails(err.Error())
	}
	return nil
}

// Update updates workspace fields.
func (r *WorkspaceRepo) Update(ctx context.Context, ws *model.Workspace) *pkg.AppError {
	filter := bson.M{"_id": ws.ID}
	update := bson.M{"$set": ws}
	_, err := r.wsCol.UpdateOne(ctx, filter, update)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to update workspace").WithDetails(err.Error())
	}
	return nil
}

// Delete removes a workspace by ID.
// Note: CASCADE deletes for projects/documents should be handled at the application level.
func (r *WorkspaceRepo) Delete(ctx context.Context, id uuid.UUID) *pkg.AppError {
	_, err := r.wsCol.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to delete workspace").WithDetails(err.Error())
	}
	return nil
}

// --- WorkspaceMember operations ---

// InsertMember adds a member to a workspace.
func (r *WorkspaceRepo) InsertMember(ctx context.Context, m *model.WorkspaceMember) *pkg.AppError {
	_, err := r.memberCol.InsertOne(ctx, m)
	if err != nil {
		return pkg.ErrInternal.WithMessage("failed to add workspace member").WithDetails(err.Error())
	}
	return nil
}

// GetMemberRole returns the role of a user in a workspace, or empty string if not a member.
func (r *WorkspaceRepo) GetMemberRole(ctx context.Context, workspaceID, userID uuid.UUID) (string, *pkg.AppError) {
	member := new(model.WorkspaceMember)
	filter := bson.M{"workspace_id": workspaceID, "user_id": userID}
	err := r.memberCol.FindOne(ctx, filter).Decode(member)
	if appErr := handleMongoError(err, "membership"); appErr != nil {
		if appErr.Code == "NOT_FOUND" {
			return "", nil // not a member — no error, just empty role
		}
		return "", appErr
	}
	return member.Role, nil
}

// CountMembers returns the number of members in a workspace.
func (r *WorkspaceRepo) CountMembers(ctx context.Context, workspaceID uuid.UUID) (int, *pkg.AppError) {
	count, err := r.memberCol.CountDocuments(ctx, bson.M{"workspace_id": workspaceID})
	if err != nil {
		return 0, pkg.ErrInternal.WithMessage("failed to count members").WithDetails(err.Error())
	}
	return int(count), nil
}

// InsertWithOwner creates a workspace and its owner membership in a single transaction.
func (r *WorkspaceRepo) InsertWithOwner(ctx context.Context, ws *model.Workspace, member *model.WorkspaceMember) *pkg.AppError {
	err := runInTx(ctx, r.db, func(sessCtx context.Context) (interface{}, error) {
		if _, err := r.wsCol.InsertOne(sessCtx, ws); err != nil {
			return nil, err
		}
		if _, err := r.memberCol.InsertOne(sessCtx, member); err != nil {
			return nil, err
		}
		return nil, nil
	})
	if err != nil {
		log.Printf("[WorkspaceRepo.InsertWithOwner] TX error: %v", err)
		return pkg.ErrInternal.WithMessage("failed to create workspace with owner").WithDetails(err.Error())
	}
	return nil
}
