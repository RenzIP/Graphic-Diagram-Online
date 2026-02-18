package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/renzip/GraDiOl/internal/dto"
	"github.com/renzip/GraDiOl/internal/middleware"
	"github.com/renzip/GraDiOl/internal/pkg"
	"github.com/renzip/GraDiOl/internal/service"
)

// ProjectHandler handles project CRUD endpoints.
type ProjectHandler struct {
	projSvc *service.ProjectService
}

// NewProjectHandler creates a new ProjectHandler.
func NewProjectHandler(projSvc *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{projSvc: projSvc}
}

// ListByWorkspace handles GET /api/workspaces/:id/projects — list projects in workspace.
func (h *ProjectHandler) ListByWorkspace(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	wsID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid workspace ID"))
	}

	pq := dto.ParsePagination(c.Query("page"), c.Query("per_page"))

	resp, appErr := h.projSvc.ListByWorkspace(c.Context(), userID, wsID, pq)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WritePaginated(c, resp.Data, resp.Meta.Page, resp.Meta.PerPage, resp.Meta.Total)
}

// Create handles POST /api/projects — create a project.
func (h *ProjectHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req dto.CreateProjectReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	resp, appErr := h.projSvc.Create(c.Context(), userID, req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusCreated, resp)
}

// Update handles PUT /api/projects/:id — update a project.
func (h *ProjectHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	projID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid project ID"))
	}

	var req dto.UpdateProjectReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	resp, appErr := h.projSvc.Update(c.Context(), userID, projID, req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, resp)
}

// Delete handles DELETE /api/projects/:id — delete a project.
func (h *ProjectHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	projID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid project ID"))
	}

	if appErr := h.projSvc.Delete(c.Context(), userID, projID); appErr != nil {
		return handleError(c, appErr)
	}

	return c.SendStatus(fiber.StatusNoContent)
}
