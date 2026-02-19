// Package app provides the shared application setup for GraDiOl API.
// Used by both the local dev server (cmd/api/main.go) and the
// Google Cloud Function entry point (function.go).
package app

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/uptrace/bun"

	"github.com/renzip/GraDiOl/internal/config"
	"github.com/renzip/GraDiOl/internal/db"
	"github.com/renzip/GraDiOl/internal/handler"
	"github.com/renzip/GraDiOl/internal/repository"
	"github.com/renzip/GraDiOl/internal/router"
	"github.com/renzip/GraDiOl/internal/service"
)

// Instance holds the initialized Fiber app and DB connection.
type Instance struct {
	App *fiber.App
	DB  *bun.DB
	Cfg *config.Config
}

// New creates a fully wired Fiber application with all middleware,
// routes, and dependency injection configured.
func New() *Instance {
	// Load config
	cfg := config.Load()

	// Connect to database
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("✓ Connected to PostgreSQL")

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
		Auth:      handler.NewAuthHandler(authSvc),
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
		inst.DB.Close()
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
