package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/renzip/GraDiOl/internal/domain/document"
)

type ProjectHandler struct {
	svc *document.Service
}

func NewProjectHandler(svc *document.Service) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

// GET /api/workspaces/:id/projects
func (h *ProjectHandler) ListByWorkspace(c *fiber.Ctx) error {
	workspaceID := c.Params("id")
	projects, err := h.svc.ListProjectsByWorkspace(c.Context(), workspaceID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to list projects"})
	}
	return c.JSON(projects)
}

// POST /api/projects
func (h *ProjectHandler) Create(c *fiber.Ctx) error {
	var req document.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}
	if req.Name == "" || req.WorkspaceID == "" {
		return c.Status(400).JSON(fiber.Map{"message": "workspace_id and name are required"})
	}

	p, err := h.svc.CreateProject(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to create project"})
	}
	return c.Status(201).JSON(p)
}

// PUT /api/projects/:id
func (h *ProjectHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req document.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}

	p, err := h.svc.UpdateProject(c.Context(), id, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to update project"})
	}
	return c.JSON(p)
}

// DELETE /api/projects/:id
func (h *ProjectHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeleteProject(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to delete project"})
	}
	return c.SendStatus(204)
}
