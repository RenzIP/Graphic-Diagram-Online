package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/renzip/GraDiOl/internal/config"
	"github.com/renzip/GraDiOl/internal/db"
	"github.com/renzip/GraDiOl/internal/handler"
	"github.com/renzip/GraDiOl/internal/repository"
	"github.com/renzip/GraDiOl/internal/router"
	"github.com/renzip/GraDiOl/internal/service"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect to database
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()
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

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 GraDiOl API starting on http://localhost%s", addr)
	log.Printf("   env=%s log_level=%s", cfg.Env, cfg.LogLevel)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// fiberErrorHandler is a custom Fiber error handler that returns JSON errors.
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
