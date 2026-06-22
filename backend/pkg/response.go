package pkg

import "github.com/gofiber/fiber/v2"

// WriteSuccess sends a JSON response with the given status code and data.
func WriteSuccess(c *fiber.Ctx, status int, data any) error {
	return c.Status(status).JSON(data)
}

// WriteError sends a standardized error JSON response.
func WriteError(c *fiber.Ctx, err *AppError) error {
	return c.Status(err.HTTPStatus).JSON(fiber.Map{
		"code":    err.Code,
		"message": err.Message,
		"details": err.Details,
	})
}

// WritePaginated sends a paginated JSON response matching the API contract:
// { data: [...], meta: { page, per_page, total, total_pages } }
func WritePaginated(c *fiber.Ctx, data any, page, perPage, total int) error {
	totalPages := 0
	if perPage > 0 {
		totalPages = (total + perPage - 1) / perPage
	}
	return c.JSON(fiber.Map{
		"data": data,
		"meta": fiber.Map{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}
