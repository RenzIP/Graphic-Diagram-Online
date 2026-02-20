// Package app provides the shared application setup for GraDiOl API.
// Used by both the local dev server (cmd/api/main.go) and the
// Google Cloud Function entry point (function.go).
package app

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/config"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/db"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/handler"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/repository"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/router"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/service"
)

// Instance holds the initialized Fiber app and DB connection.
type Instance struct {
	App *fiber.App
	DB  *mongo.Database
	Cfg *config.Config
}

// New creates a fully wired Fiber application with all middleware,
// routes, and dependency injection configured.
func New() *Instance {
	// Load config
	cfg := config.Load()

	// Connect to database
	database, err := db.Connect(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("✓ Connected to MongoDB")

	// --- Repository layer ---
	userRepo := repository.NewUserRepo(database)
	wsRepo := repository.NewWorkspaceRepo(database)
	projRepo := repository.NewProjectRepo(database)
	docRepo := repository.NewDocumentRepo(database)

	// --- Service layer ---
	authSvc := service.NewAuthService(userRepo)
	wsSvc := service.NewWorkspaceService(wsRepo)
	projSvc := service.NewProjectService(projRepo, wsSvc)
	docSvc := service.NewDocumentService(docRepo, projRepo, wsSvc)

	// --- Handler layer ---
	handlers := router.Handlers{
		Health:    handler.NewHealthHandler(),
		Auth:      handler.NewAuthHandler(authSvc, cfg),
		Workspace: handler.NewWorkspaceHandler(wsSvc),
		Project:   handler.NewProjectHandler(projSvc),
		Document:  handler.NewDocumentHandler(docSvc),
	}

	// Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "GraDiOl API",
		ErrorHandler: fiberErrorHandler,
	})

	// Register routes with middleware stack
	router.Setup(app, cfg, handlers)

	return &Instance{
		App: app,
		DB:  database,
		Cfg: cfg,
	}
}

// Close gracefully shuts down the application (closes DB, etc).
func (inst *Instance) Close() {
	if inst.DB != nil {
		db.Disconnect(inst.DB)
	}
}

// fiberErrorHandler returns JSON errors for any unhandled Fiber errors.
func fiberErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "internal server error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"code":    "INTERNAL_ERROR",
		"message": message,
	})
}
