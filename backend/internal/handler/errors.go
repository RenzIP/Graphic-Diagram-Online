package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// handleError writes an AppError as a JSON response.
// If the error is nil, it writes a generic 500.
func handleError(c *fiber.Ctx, appErr *pkg.AppError) error {
	if appErr == nil {
		return pkg.WriteError(c, pkg.ErrInternal)
	}
	return pkg.WriteError(c, appErr)
}
