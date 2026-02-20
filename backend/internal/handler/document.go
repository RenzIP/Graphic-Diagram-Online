package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/dto"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/middleware"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/service"
)

// DocumentHandler handles document CRUD and recent endpoints.
type DocumentHandler struct {
	docSvc *service.DocumentService
}

// NewDocumentHandler creates a new DocumentHandler.
func NewDocumentHandler(docSvc *service.DocumentService) *DocumentHandler {
	return &DocumentHandler{docSvc: docSvc}
}

// ListByProject handles GET /api/projects/:id/documents.
func (h *DocumentHandler) ListByProject(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	projID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid project ID"))
	}

	pq := dto.ParsePagination(c.Query("page"), c.Query("per_page"))
	diagramType := c.Query("diagram_type")
	sortBy := c.Query("sort_by", "updated_at")
	sortOrder := c.Query("sort_order", "desc")

	resp, appErr := h.docSvc.ListByProject(c.Context(), userID, projID, pq, diagramType, sortBy, sortOrder)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WritePaginated(c, resp.Data, resp.Meta.Page, resp.Meta.PerPage, resp.Meta.Total)
}

// GetByID handles GET /api/documents/:id — full document with content/view.
func (h *DocumentHandler) GetByID(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	docID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid document ID"))
	}

	resp, appErr := h.docSvc.GetByID(c.Context(), userID, docID)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, resp)
}

// Create handles POST /api/documents — create a new document.
func (h *DocumentHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req dto.CreateDocumentReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	resp, appErr := h.docSvc.Create(c.Context(), userID, req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusCreated, resp)
}

// Update handles PUT /api/documents/:id — update document.
func (h *DocumentHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	docID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid document ID"))
	}

	var req dto.UpdateDocumentReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	resp, appErr := h.docSvc.Update(c.Context(), userID, docID, req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, resp)
}

// Delete handles DELETE /api/documents/:id — delete document.
func (h *DocumentHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	docID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid document ID"))
	}

	if appErr := h.docSvc.Delete(c.Context(), userID, docID); appErr != nil {
		return handleError(c, appErr)
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// Recent handles GET /api/documents/recent — recently updated documents dashboard widget.
func (h *DocumentHandler) Recent(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	limit := 10
	if v, err := strconv.Atoi(c.Query("limit")); err == nil && v > 0 {
		limit = v
	}

	resp, appErr := h.docSvc.ListRecent(c.Context(), userID, limit)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, resp)
}
