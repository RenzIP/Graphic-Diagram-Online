package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/domain/document"
)

type WorkspaceHandler struct {
	svc *document.Service
}

func NewWorkspaceHandler(svc *document.Service) *WorkspaceHandler {
	return &WorkspaceHandler{svc: svc}
}

// GET /api/workspaces
func (h *WorkspaceHandler) List(c *fiber.Ctx) error {
	workspaces, err := h.svc.ListWorkspaces(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to list workspaces"})
	}
	return c.JSON(workspaces)
}

// POST /api/workspaces
func (h *WorkspaceHandler) Create(c *fiber.Ctx) error {
	var req document.CreateWorkspaceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}
	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"message": "Name is required"})
	}

	w, err := h.svc.CreateWorkspace(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to create workspace"})
	}
	return c.Status(201).JSON(w)
}

// PUT /api/workspaces/:id
func (h *WorkspaceHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req document.CreateWorkspaceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}

	w, err := h.svc.UpdateWorkspace(c.Context(), id, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to update workspace"})
	}
	return c.JSON(w)
}

// DELETE /api/workspaces/:id
func (h *WorkspaceHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeleteWorkspace(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to delete workspace"})
	}
	return c.SendStatus(204)
}
