package db

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
)

func Connect(databaseURL string) (*bun.DB, error) {
	// Parse pgx config from DATABASE_URL
	config, err := pgx.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Use simple protocol — required for Supabase Pooler (Supavisor transaction mode)
	// which does not support prepared statements (extended query protocol).
	config.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Register pgx connector with database/sql
	sqldb := stdlib.OpenDB(*config)

	// Connection pool settings — tuned for serverless (GCF)
	sqldb.SetMaxOpenConns(5)
	sqldb.SetMaxIdleConns(2)
	sqldb.SetConnMaxLifetime(5 * time.Minute)
	sqldb.SetConnMaxIdleTime(1 * time.Minute)

	if err := sqldb.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	db := bun.NewDB(sqldb, pgdialect.New())
	db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

	return db, nil
}
