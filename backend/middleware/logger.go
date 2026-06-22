package middleware

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Logger returns a middleware that logs structured request information.
func Logger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		// Process request
		err := c.Next()

		latency := time.Since(start)
		status := c.Response().StatusCode()

		reqID, _ := c.Locals("requestId").(string)
		userID, _ := c.Locals("userId").(uuid.UUID)

		userStr := ""
		if userID != uuid.Nil {
			userStr = userID.String()
		}

		log.Printf("[HTTP] method=%s path=%s status=%d latency=%s request_id=%s user_id=%s",
			c.Method(),
			c.Path(),
			status,
			latency.Round(time.Millisecond),
			reqID,
			userStr,
		)

		return err
	}
}
