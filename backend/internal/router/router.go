package router

import (
	"github.com/gofiber/fiber/v2"

	"github.com/renzip/GraDiOl/internal/config"
	"github.com/renzip/GraDiOl/internal/handler"
	"github.com/renzip/GraDiOl/internal/middleware"
)

// Handlers groups all handler structs for route registration.
type Handlers struct {
	Health    *handler.HealthHandler
	Auth      *handler.AuthHandler
	Workspace *handler.WorkspaceHandler
	Project   *handler.ProjectHandler
	Document  *handler.DocumentHandler
}

// Setup registers all routes with middleware.
// Middleware order: Recover → RequestID → Logger → CORS → [Auth for protected routes]
func Setup(app *fiber.App, cfg *config.Config, h Handlers) {
	// Global middleware stack (applied to all routes)
	app.Use(middleware.Recover())
	app.Use(middleware.RequestID())
	app.Use(middleware.Logger())
	app.Use(middleware.CORS(cfg.FrontendURL))

	// API group
	api := app.Group("/api")

	// --- Public endpoints (no auth required) ---
	api.Get("/health", h.Health.Check)

	// --- Protected endpoints (auth required) ---
	protected := api.Group("", middleware.Auth(cfg.SupabaseJWTSecret, cfg.SupabaseURL))

	// Auth
	protected.Post("/auth/callback", h.Auth.Callback)
	protected.Get("/auth/me", h.Auth.Me)

	// Workspaces
	protected.Get("/workspaces", h.Workspace.List)
	protected.Post("/workspaces", h.Workspace.Create)
	protected.Put("/workspaces/:id", h.Workspace.Update)
	protected.Delete("/workspaces/:id", h.Workspace.Delete)

	// Projects (nested under workspaces for listing)
	protected.Get("/workspaces/:id/projects", h.Project.ListByWorkspace)
	protected.Post("/projects", h.Project.Create)
	protected.Put("/projects/:id", h.Project.Update)
	protected.Delete("/projects/:id", h.Project.Delete)

	// Documents
	protected.Get("/documents/recent", h.Document.Recent) // Must be before :id route
	protected.Get("/projects/:id/documents", h.Document.ListByProject)
	protected.Get("/documents/:id", h.Document.GetByID)
	protected.Post("/documents", h.Document.Create)
	protected.Put("/documents/:id", h.Document.Update)
	protected.Delete("/documents/:id", h.Document.Delete)
}
