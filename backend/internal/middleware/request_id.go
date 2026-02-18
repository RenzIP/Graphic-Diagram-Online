package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// RequestID generates a UUID v4 for each request and sets it as
// the X-Request-ID response header and ctx.Locals("requestId").
func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Use incoming header if already set (e.g. by load balancer)
		id := c.Get("X-Request-ID")
		if id == "" {
			id = uuid.New().String()
		}
		c.Locals("requestId", id)
		c.Set("X-Request-ID", id)
		return c.Next()
	}
}
