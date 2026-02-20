package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/config"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/db"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	cfg := config.Load()

	database, err := db.Connect(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}
	defer db.Disconnect(database)

	ctx := context.Background()

	switch command {
	case "setup":
		if err := setupCollections(ctx, database); err != nil {
			log.Fatalf("❌ Setup failed: %v", err)
		}
	case "seed":
		if err := runSeed(ctx, database); err != nil {
			log.Fatalf("❌ Seed failed: %v", err)
		}
	case "drop":
		if err := dropCollections(ctx, database); err != nil {
			log.Fatalf("❌ Drop failed: %v", err)
		}
	case "reset":
		if err := dropCollections(ctx, database); err != nil {
			log.Fatalf("❌ Drop failed: %v", err)
		}
		if err := setupCollections(ctx, database); err != nil {
			log.Fatalf("❌ Setup failed: %v", err)
		}
		fmt.Println("  🎉 Reset complete.")
	default:
		fmt.Printf("Unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`Usage: go run cmd/migrate/main.go <command>

Commands:
  setup    Create collections and indexes
  seed     Insert seed data
  drop     Drop all collections (DESTRUCTIVE)
  reset    Drop all then re-create (DESTRUCTIVE)`)
}

// collections is the list of MongoDB collections to manage.
var collections = []string{
	"user_profiles",
	"workspaces",
	"workspace_members",
	"projects",
	"documents",
}

// setupCollections creates collections and their indexes.
func setupCollections(ctx context.Context, database *mongo.Database) error {
	// Create collections (MongoDB creates them implicitly, but we can be explicit)
	for _, name := range collections {
		if err := database.CreateCollection(ctx, name); err != nil {
			// Ignore "already exists" errors
			if !mongo.IsDuplicateKeyError(err) {
				log.Printf("  ℹ️  Collection %s may already exist, continuing...", name)
			}
		} else {
			fmt.Printf("  ✅ Created collection: %s\n", name)
		}
	}

	// Create indexes
	fmt.Println("\n  Creating indexes...")

	// workspace_members: compound unique index
	wmCol := database.Collection("workspace_members")
	_, err := wmCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "workspace_id", Value: 1}, {Key: "user_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("failed to create workspace_members index: %w", err)
	}
	fmt.Println("  ✅ Index: workspace_members (workspace_id, user_id) UNIQUE")

	// workspaces: unique slug
	wsCol := database.Collection("workspaces")
	_, err = wsCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "slug", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("failed to create workspaces slug index: %w", err)
	}
	fmt.Println("  ✅ Index: workspaces (slug) UNIQUE")

	// documents: indexes for common queries
	docCol := database.Collection("documents")
	docIndexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "project_id", Value: 1}}},
		{Keys: bson.D{{Key: "workspace_id", Value: 1}}},
		{Keys: bson.D{{Key: "created_by", Value: 1}}},
		{Keys: bson.D{{Key: "updated_at", Value: -1}}},
		{Keys: bson.D{{Key: "diagram_type", Value: 1}}},
	}
	_, err = docCol.Indexes().CreateMany(ctx, docIndexes)
	if err != nil {
		return fmt.Errorf("failed to create documents indexes: %w", err)
	}
	fmt.Println("  ✅ Indexes: documents (project_id, workspace_id, created_by, updated_at, diagram_type)")

	// projects: index on workspace_id
	projCol := database.Collection("projects")
	_, err = projCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "workspace_id", Value: 1}},
	})
	if err != nil {
		return fmt.Errorf("failed to create projects index: %w", err)
	}
	fmt.Println("  ✅ Index: projects (workspace_id)")

	fmt.Println("\n  🎉 Setup complete.")
	return nil
}

// runSeed inserts sample data.
func runSeed(ctx context.Context, database *mongo.Database) error {
	now := time.Now()

	// Seed user profile
	userCol := database.Collection("user_profiles")
	_, err := userCol.InsertOne(ctx, bson.M{
		"_id":        "00000000-0000-0000-0000-000000000001",
		"full_name":  "Demo User",
		"avatar_url": nil,
		"created_at": now,
	})
	if err != nil {
		log.Printf("  ⚠️  User seed may already exist: %v", err)
	} else {
		fmt.Println("  ✅ Seeded: user_profiles")
	}

	// Seed workspace
	wsCol := database.Collection("workspaces")
	_, err = wsCol.InsertOne(ctx, bson.M{
		"_id":         "00000000-0000-0000-0000-000000000010",
		"name":        "Demo Workspace",
		"slug":        "demo-workspace",
		"owner_id":    "00000000-0000-0000-0000-000000000001",
		"description": "Default workspace for demo",
		"created_at":  now,
		"updated_at":  now,
	})
	if err != nil {
		log.Printf("  ⚠️  Workspace seed may already exist: %v", err)
	} else {
		fmt.Println("  ✅ Seeded: workspaces")
	}

	// Seed workspace member
	wmCol := database.Collection("workspace_members")
	_, err = wmCol.InsertOne(ctx, bson.M{
		"workspace_id": "00000000-0000-0000-0000-000000000010",
		"user_id":      "00000000-0000-0000-0000-000000000001",
		"role":         "owner",
		"joined_at":    now,
	})
	if err != nil {
		log.Printf("  ⚠️  Member seed may already exist: %v", err)
	} else {
		fmt.Println("  ✅ Seeded: workspace_members")
	}

	fmt.Println("\n  🌱 Seed data applied successfully.")
	return nil
}

// dropCollections drops all managed collections.
func dropCollections(ctx context.Context, database *mongo.Database) error {
	fmt.Println("  ⚠️  Dropping all collections...")
	for _, name := range collections {
		if err := database.Collection(name).Drop(ctx); err != nil {
			return fmt.Errorf("failed to drop %s: %w", name, err)
		}
		fmt.Printf("  🗑️  Dropped: %s\n", name)
	}
	fmt.Println("  ✅ All collections dropped.")
	return nil
}
