package middleware

import (
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/renzip/GraDiOl/internal/pkg"
)

// Auth returns a Fiber middleware that validates Supabase JWT tokens.
// On success, it sets ctx.Locals("userId") to the UUID from the `sub` claim.
func Auth(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extract the Bearer token from the Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("missing Authorization header"))
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid Authorization header format"))
		}
		tokenStr := parts[1]

		// Parse and validate the JWT using the Supabase JWT secret (HS256)
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			log.Printf("[Auth] JWT validation failed: %v (secret length: %d, token prefix: %.20s...)", err, len(jwtSecret), tokenStr)
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid or expired token"))
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid token claims"))
		}

		// Extract user ID from the `sub` claim (Supabase auth.uid())
		sub, ok := claims["sub"].(string)
		if !ok || sub == "" {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("missing sub claim in token"))
		}

		userID, err := uuid.Parse(sub)
		if err != nil {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid user ID in token"))
		}

		// Set user context for downstream handlers
		c.Locals("userId", userID)

		// Optionally extract email if present
		if email, ok := claims["email"].(string); ok {
			c.Locals("email", email)
		}

		return c.Next()
	}
}

// GetUserID extracts the authenticated user's UUID from ctx.Locals.
// Returns uuid.Nil if not set (should not happen behind Auth middleware).
func GetUserID(c *fiber.Ctx) uuid.UUID {
	if id, ok := c.Locals("userId").(uuid.UUID); ok {
		return id
	}
	return uuid.Nil
}
