package http

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/domain/document"
)

type DocumentHandler struct {
	svc *document.Service
}

func NewDocumentHandler(svc *document.Service) *DocumentHandler {
	return &DocumentHandler{svc: svc}
}

// GET /api/projects/:id/documents
func (h *DocumentHandler) ListByProject(c *fiber.Ctx) error {
	projectID := c.Params("id")
	docs, err := h.svc.ListByProject(c.Context(), projectID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to list documents"})
	}
	return c.JSON(docs)
}

// POST /api/documents
// Frontend utils/api.ts sends { title, content } without project_id
func (h *DocumentHandler) Create(c *fiber.Ctx) error {
	var req document.CreateDocumentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}

	doc, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to create document"})
	}
	return c.Status(201).JSON(doc)
}

// GET /api/documents/:id
func (h *DocumentHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	doc, err := h.svc.GetByID(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Document not found"})
	}
	return c.JSON(doc)
}

// PUT /api/documents/:id
func (h *DocumentHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	var body map[string]interface{}
	if err := json.Unmarshal(c.Body(), &body); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid request body"})
	}

	doc, err := h.svc.Update(c.Context(), id, body)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to update document"})
	}
	return c.JSON(doc)
}

// DELETE /api/documents/:id
func (h *DocumentHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(500).JSON(fiber.Map{"message": "Failed to delete document"})
	}
	return c.SendStatus(204)
}
