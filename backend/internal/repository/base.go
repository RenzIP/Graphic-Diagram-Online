package repository

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// handleMongoError maps common MongoDB errors to AppError.
func handleMongoError(err error, entityName string) *pkg.AppError {
	if err == nil {
		return nil
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		return pkg.ErrNotFound.WithMessage(entityName + " not found")
	}
	return pkg.ErrInternal.WithMessage("database error").WithDetails(err.Error())
}

// paginationOpts returns FindOptions with limit and skip (offset) applied.
func paginationOpts(limit, offset int) *options.FindOptionsBuilder {
	return options.Find().SetLimit(int64(limit)).SetSkip(int64(offset))
}

// runInTx executes a function within a MongoDB session transaction.
func runInTx(ctx context.Context, db *mongo.Database, fn func(ctx context.Context) (interface{}, error)) error {
	session, err := db.Client().StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, fn)
	return err
}
