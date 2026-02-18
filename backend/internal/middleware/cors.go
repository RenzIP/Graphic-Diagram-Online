package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// CORS returns a configured CORS middleware that allows the given frontend origin.
func CORS(frontendURL string) fiber.Handler {
	return cors.New(cors.Config{
		AllowOrigins:     frontendURL,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Authorization,Content-Type,X-Request-ID",
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours preflight cache
	})
}
