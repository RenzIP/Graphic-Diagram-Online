package middleware

import (
	"log"
	"runtime/debug"

	"github.com/gofiber/fiber/v2"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// Recover returns a middleware that catches panics and returns a 500 JSON error.
func Recover() fiber.Handler {
	return func(c *fiber.Ctx) (err error) {
		defer func() {
			if r := recover(); r != nil {
				reqID, _ := c.Locals("requestId").(string)
				log.Printf("[PANIC] request_id=%s error=%v\n%s", reqID, r, debug.Stack())
				err = pkg.WriteError(c, pkg.ErrInternal.WithMessage("internal server error"))
			}
		}()
		return c.Next()
	}
}
