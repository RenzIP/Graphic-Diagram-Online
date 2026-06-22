package router

import (
	"github.com/gofiber/fiber/v2"

	"github.com/RenzIP/Graphic-Diagram-Online/config"
	"github.com/RenzIP/Graphic-Diagram-Online/handler"
	"github.com/RenzIP/Graphic-Diagram-Online/middleware"
)

type Handlers struct {
	Health    *handler.HealthHandler
	Auth      *handler.AuthHandler
	Workspace *handler.WorkspaceHandler
	Project   *handler.ProjectHandler
	Document  *handler.DocumentHandler
}

func Setup(app *fiber.App, cfg *config.Config, h Handlers) {
	app.Use(middleware.Recover())
	app.Use(middleware.RequestID())
	app.Use(middleware.Logger())
	app.Use(middleware.CORS(cfg.FrontendURL))

	api := app.Group("/api")

	app.Post("/register", h.Auth.Register)
	app.Post("/login", h.Auth.Login)

	api.Get("/health", h.Health.Check)
	api.Post("/register", h.Auth.Register)
	api.Post("/login", h.Auth.Login)
	api.Post("/auth/register", h.Auth.Register)
	api.Post("/auth/login", h.Auth.Login)

	api.Get("/auth/google", h.Auth.GoogleLogin)
	api.Get("/auth/google/callback", h.Auth.GoogleCallback)
	api.Get("/auth/github", h.Auth.GitHubLogin)
	api.Get("/auth/github/callback", h.Auth.GitHubCallback)

	rootProtected := app.Group("", middleware.Auth(cfg.JWTSecret))
	rootProtected.Put("/change-password", h.Auth.ChangePassword)

	protected := api.Group("", middleware.Auth(cfg.JWTSecret))

	protected.Get("/auth/me", h.Auth.Me)
	protected.Put("/change-password", h.Auth.ChangePassword)
	protected.Post("/change-password", h.Auth.ChangePassword)

	protected.Get("/workspaces", h.Workspace.List)
	protected.Post("/workspaces", h.Workspace.Create)
	protected.Put("/workspaces/:id", h.Workspace.Update)
	protected.Delete("/workspaces/:id", h.Workspace.Delete)

	protected.Get("/workspaces/:id/projects", h.Project.ListByWorkspace)
	protected.Post("/projects", h.Project.Create)
	protected.Put("/projects/:id", h.Project.Update)
	protected.Delete("/projects/:id", h.Project.Delete)

	protected.Get("/documents/recent", h.Document.Recent)
	protected.Get("/projects/:id/documents", h.Document.ListByProject)
	protected.Get("/documents/:id", h.Document.GetByID)
	protected.Post("/documents", h.Document.Create)
	protected.Put("/documents/:id", h.Document.Update)
	protected.Delete("/documents/:id", h.Document.Delete)
}
