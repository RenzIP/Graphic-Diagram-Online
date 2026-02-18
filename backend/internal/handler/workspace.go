package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/renzip/GraDiOl/internal/dto"
	"github.com/renzip/GraDiOl/internal/middleware"
	"github.com/renzip/GraDiOl/internal/pkg"
	"github.com/renzip/GraDiOl/internal/service"
)

// WorkspaceHandler handles workspace CRUD endpoints.
type WorkspaceHandler struct {
	wsSvc *service.WorkspaceService
}

// NewWorkspaceHandler creates a new WorkspaceHandler.
func NewWorkspaceHandler(wsSvc *service.WorkspaceService) *WorkspaceHandler {
	return &WorkspaceHandler{wsSvc: wsSvc}
}

// List handles GET /api/workspaces — list workspaces the user belongs to.
func (h *WorkspaceHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	pq := dto.ParsePagination(c.Query("page"), c.Query("per_page"))

	resp, appErr := h.wsSvc.ListByUser(c.Context(), userID, pq)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WritePaginated(c, resp.Data, resp.Meta.Page, resp.Meta.PerPage, resp.Meta.Total)
}

// Create handles POST /api/workspaces — create a new workspace.
func (h *WorkspaceHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req dto.CreateWorkspaceReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	resp, appErr := h.wsSvc.Create(c.Context(), userID, req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusCreated, resp)
}

// Update handles PUT /api/workspaces/:id — update workspace.
func (h *WorkspaceHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	wsID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid workspace ID"))
	}

	var req dto.UpdateWorkspaceReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	resp, appErr := h.wsSvc.Update(c.Context(), userID, wsID, req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, resp)
}

// Delete handles DELETE /api/workspaces/:id — delete workspace.
func (h *WorkspaceHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	wsID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid workspace ID"))
	}

	if appErr := h.wsSvc.Delete(c.Context(), userID, wsID); appErr != nil {
		return handleError(c, appErr)
	}

	return c.SendStatus(fiber.StatusNoContent)
}
