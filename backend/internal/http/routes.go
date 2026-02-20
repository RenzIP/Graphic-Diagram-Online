package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/domain/document"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/ws"
)

func RegisterRoutes(app *fiber.App, svc *document.Service, hub *ws.Hub) {
	api := app.Group("/api")

	// Health
	api.Get("/health", HealthCheck)

	// Auth (stub — returns mock user for now)
	api.Post("/auth/callback", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"token": "mock-token",
			"user": fiber.Map{
				"id":         "user-1",
				"email":      "user@example.com",
				"full_name":  "Demo User",
				"avatar_url": "",
			},
		})
	})
	api.Get("/auth/me", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"id":         "user-1",
			"email":      "user@example.com",
			"full_name":  "Demo User",
			"avatar_url": "",
		})
	})

	// Workspaces
	wh := NewWorkspaceHandler(svc)
	api.Get("/workspaces", wh.List)
	api.Post("/workspaces", wh.Create)
	api.Put("/workspaces/:id", wh.Update)
	api.Delete("/workspaces/:id", wh.Delete)

	// Projects
	ph := NewProjectHandler(svc)
	api.Get("/workspaces/:id/projects", ph.ListByWorkspace)
	api.Post("/projects", ph.Create)
	api.Put("/projects/:id", ph.Update)
	api.Delete("/projects/:id", ph.Delete)

	// Documents
	dh := NewDocumentHandler(svc)
	api.Get("/projects/:id/documents", dh.ListByProject)
	api.Post("/documents", dh.Create)
	api.Get("/documents/:id", dh.Get)
	api.Put("/documents/:id", dh.Update)
	api.Delete("/documents/:id", dh.Delete)

	// WebSocket
	app.Use("/ws", ws.UpgradeMiddleware())
	app.Get("/ws/:documentId", ws.HandleWebSocket(hub))
}
