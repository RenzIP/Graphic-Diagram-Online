package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/renzip/GraDiOl/internal/config"

	_ "github.com/jackc/pgx/v5/stdlib"
)

const migrationsDir = "migrations"

// migration represents a single migration file pair (up + down).
type migration struct {
	Version  string // e.g. "001"
	Name     string // e.g. "create_user_profiles"
	UpFile   string // full path to .up.sql
	DownFile string // full path to .down.sql
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	cfg := config.Load()

	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping database: %v", err)
	}

	ctx := context.Background()

	// Ensure schema_migrations table exists
	if err := ensureMigrationsTable(ctx, db); err != nil {
		log.Fatalf("❌ Failed to create migrations table: %v", err)
	}

	// Discover migration files
	migrations, err := discoverMigrations()
	if err != nil {
		log.Fatalf("❌ Failed to discover migrations: %v", err)
	}

	switch command {
	case "up":
		if err := migrateUp(ctx, db, migrations); err != nil {
			log.Fatalf("❌ Migration up failed: %v", err)
		}
	case "down":
		if err := migrateDown(ctx, db, migrations); err != nil {
			log.Fatalf("❌ Migration down failed: %v", err)
		}
	case "status":
		if err := migrateStatus(ctx, db, migrations); err != nil {
			log.Fatalf("❌ Migration status failed: %v", err)
		}
	case "seed":
		if err := runSeed(ctx, db); err != nil {
			log.Fatalf("❌ Seed failed: %v", err)
		}
	case "reset":
		if err := migrateReset(ctx, db, migrations); err != nil {
			log.Fatalf("❌ Migration reset failed: %v", err)
		}
	default:
		fmt.Printf("Unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`Usage: go run cmd/migrate/main.go <command>

Commands:
  up       Apply all pending migrations
  down     Rollback the last applied migration
  status   Show migration status
  seed     Run seed.sql
  reset    Rollback all migrations then re-apply (DESTRUCTIVE)`)
}

// ensureMigrationsTable creates the schema_migrations tracking table if it doesn't exist.
func ensureMigrationsTable(ctx context.Context, db *sql.DB) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version    TEXT PRIMARY KEY,
			name       TEXT NOT NULL,
			applied_at TIMESTAMPTZ DEFAULT now()
		);`
	_, err := db.ExecContext(ctx, query)
	return err
}

// discoverMigrations scans the migrations/ directory for .up.sql and .down.sql files.
func discoverMigrations() ([]migration, error) {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("cannot read %s directory: %w", migrationsDir, err)
	}

	migrationMap := make(map[string]*migration)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()

		if strings.HasSuffix(name, ".up.sql") {
			key := strings.TrimSuffix(name, ".up.sql")
			parts := strings.SplitN(key, "_", 2)
			version := parts[0]
			migName := ""
			if len(parts) > 1 {
				migName = parts[1]
			}

			if _, ok := migrationMap[version]; !ok {
				migrationMap[version] = &migration{Version: version, Name: migName}
			}
			migrationMap[version].UpFile = filepath.Join(migrationsDir, name)
			migrationMap[version].Name = migName

		} else if strings.HasSuffix(name, ".down.sql") {
			key := strings.TrimSuffix(name, ".down.sql")
			parts := strings.SplitN(key, "_", 2)
			version := parts[0]
			migName := ""
			if len(parts) > 1 {
				migName = parts[1]
			}

			if _, ok := migrationMap[version]; !ok {
				migrationMap[version] = &migration{Version: version, Name: migName}
			}
			migrationMap[version].DownFile = filepath.Join(migrationsDir, name)
		}
	}

	// Sort by version
	var migrations []migration
	for _, m := range migrationMap {
		migrations = append(migrations, *m)
	}
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// getAppliedVersions returns a set of already-applied migration versions.
func getAppliedVersions(ctx context.Context, db *sql.DB) (map[string]bool, error) {
	rows, err := db.QueryContext(ctx, "SELECT version FROM schema_migrations ORDER BY version")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		applied[v] = true
	}
	return applied, rows.Err()
}

// migrateUp applies all pending migrations in order.
func migrateUp(ctx context.Context, db *sql.DB, migrations []migration) error {
	applied, err := getAppliedVersions(ctx, db)
	if err != nil {
		return err
	}

	count := 0
	for _, m := range migrations {
		if applied[m.Version] {
			continue
		}
		if m.UpFile == "" {
			return fmt.Errorf("migration %s has no .up.sql file", m.Version)
		}

		content, err := os.ReadFile(m.UpFile)
		if err != nil {
			return fmt.Errorf("failed to read %s: %w", m.UpFile, err)
		}

		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to begin transaction: %w", err)
		}

		if _, err := tx.ExecContext(ctx, string(content)); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to apply migration %s (%s): %w", m.Version, m.Name, err)
		}

		if _, err := tx.ExecContext(ctx,
			"INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
			m.Version, m.Name,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %s: %w", m.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", m.Version, err)
		}

		fmt.Printf("  ✅ Applied: %s_%s\n", m.Version, m.Name)
		count++
	}

	if count == 0 {
		fmt.Println("  ✅ All migrations already applied.")
	} else {
		fmt.Printf("\n  🎉 Applied %d migration(s).\n", count)
	}
	return nil
}

// migrateDown rolls back the last applied migration.
func migrateDown(ctx context.Context, db *sql.DB, migrations []migration) error {
	applied, err := getAppliedVersions(ctx, db)
	if err != nil {
		return err
	}

	// Find the last applied migration
	var last *migration
	for i := len(migrations) - 1; i >= 0; i-- {
		if applied[migrations[i].Version] {
			last = &migrations[i]
			break
		}
	}

	if last == nil {
		fmt.Println("  ℹ️  No migrations to rollback.")
		return nil
	}

	if last.DownFile == "" {
		return fmt.Errorf("migration %s has no .down.sql file", last.Version)
	}

	content, err := os.ReadFile(last.DownFile)
	if err != nil {
		return fmt.Errorf("failed to read %s: %w", last.DownFile, err)
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	if _, err := tx.ExecContext(ctx, string(content)); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to rollback migration %s (%s): %w", last.Version, last.Name, err)
	}

	if _, err := tx.ExecContext(ctx,
		"DELETE FROM schema_migrations WHERE version = $1",
		last.Version,
	); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove migration record %s: %w", last.Version, err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback %s: %w", last.Version, err)
	}

	fmt.Printf("  ⬇️  Rolled back: %s_%s\n", last.Version, last.Name)
	return nil
}

// migrateStatus prints a table showing which migrations are applied.
func migrateStatus(ctx context.Context, db *sql.DB, migrations []migration) error {
	rows, err := db.QueryContext(ctx, "SELECT version, name, applied_at FROM schema_migrations ORDER BY version")
	if err != nil {
		return err
	}
	defer rows.Close()

	appliedMap := make(map[string]time.Time)
	for rows.Next() {
		var v, n string
		var at time.Time
		if err := rows.Scan(&v, &n, &at); err != nil {
			return err
		}
		appliedMap[v] = at
	}
	if err := rows.Err(); err != nil {
		return err
	}

	fmt.Println("\n  Migration Status")
	fmt.Println("  ─────────────────────────────────────────────────────────")
	fmt.Printf("  %-8s %-30s %-10s %s\n", "VERSION", "NAME", "STATUS", "APPLIED AT")
	fmt.Println("  ─────────────────────────────────────────────────────────")

	for _, m := range migrations {
		if at, ok := appliedMap[m.Version]; ok {
			fmt.Printf("  %-8s %-30s %-10s %s\n", m.Version, m.Name, "✅ Applied", at.Format("2006-01-02 15:04:05"))
		} else {
			fmt.Printf("  %-8s %-30s %-10s %s\n", m.Version, m.Name, "⏳ Pending", "-")
		}
	}
	fmt.Println()
	return nil
}

// runSeed executes the seed.sql file.
func runSeed(ctx context.Context, db *sql.DB) error {
	seedFile := filepath.Join(migrationsDir, "seed.sql")
	content, err := os.ReadFile(seedFile)
	if err != nil {
		return fmt.Errorf("failed to read %s: %w", seedFile, err)
	}

	if _, err := db.ExecContext(ctx, string(content)); err != nil {
		return fmt.Errorf("failed to execute seed: %w", err)
	}

	fmt.Println("  🌱 Seed data applied successfully.")
	return nil
}

// migrateReset rolls back all migrations, then re-applies them.
func migrateReset(ctx context.Context, db *sql.DB, migrations []migration) error {
	fmt.Println("  ⚠️  Resetting all migrations (rollback all, then re-apply)...")
	fmt.Println()

	// Rollback all in reverse order
	applied, err := getAppliedVersions(ctx, db)
	if err != nil {
		return err
	}

	for i := len(migrations) - 1; i >= 0; i-- {
		m := migrations[i]
		if !applied[m.Version] {
			continue
		}
		if m.DownFile == "" {
			return fmt.Errorf("migration %s has no .down.sql file", m.Version)
		}

		content, err := os.ReadFile(m.DownFile)
		if err != nil {
			return fmt.Errorf("failed to read %s: %w", m.DownFile, err)
		}

		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return err
		}

		if _, err := tx.ExecContext(ctx, string(content)); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to rollback migration %s: %w", m.Version, err)
		}

		if _, err := tx.ExecContext(ctx, "DELETE FROM schema_migrations WHERE version = $1", m.Version); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to remove migration record %s: %w", m.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return err
		}

		fmt.Printf("  ⬇️  Rolled back: %s_%s\n", m.Version, m.Name)
	}

	fmt.Println()

	// Re-apply all
	return migrateUp(ctx, db, migrations)
}
