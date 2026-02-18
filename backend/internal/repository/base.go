package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/uptrace/bun"

	"github.com/renzip/GraDiOl/internal/pkg"
)

// applyPagination adds LIMIT/OFFSET to a Bun SelectQuery.
func applyPagination(q *bun.SelectQuery, limit, offset int) *bun.SelectQuery {
	return q.Limit(limit).Offset(offset)
}

// handleQueryError maps common database errors to AppError.
func handleQueryError(err error, entityName string) *pkg.AppError {
	if err == nil {
		return nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return pkg.ErrNotFound.WithMessage(entityName + " not found")
	}
	return pkg.ErrInternal.WithMessage("database error").WithDetails(err.Error())
}

// runInTx executes a function within a database transaction.
func runInTx(ctx context.Context, db *bun.DB, fn func(tx bun.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p) // re-throw after rollback
		}
	}()

	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}
