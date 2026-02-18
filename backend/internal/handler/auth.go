package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/renzip/GraDiOl/internal/middleware"
	"github.com/renzip/GraDiOl/internal/pkg"
	"github.com/renzip/GraDiOl/internal/service"
)

// AuthHandler handles auth-related endpoints.
type AuthHandler struct {
	authSvc *service.AuthService
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authSvc *service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

// Callback handles POST /api/auth/callback.
// Receives the Supabase tokens from frontend, upserts the user profile,
// and returns the user data.
func (h *AuthHandler) Callback(c *fiber.Ctx) error {
	// The auth callback is called after frontend completes OAuth.
	// The JWT is already validated by the auth middleware at this point.
	userID := middleware.GetUserID(c)
	email, _ := c.Locals("email").(string)

	// Upsert profile (full_name and avatar_url may come from JWT metadata later)
	if appErr := h.authSvc.UpsertProfile(c.Context(), userID, nil, nil); appErr != nil {
		return handleError(c, appErr)
	}

	profile, appErr := h.authSvc.GetProfile(c.Context(), userID)
	if appErr != nil {
		return handleError(c, appErr)
	}
	profile.Email = email

	return pkg.WriteSuccess(c, fiber.StatusOK, fiber.Map{
		"user": profile,
	})
}

// Me handles GET /api/auth/me — returns the current user's profile.
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	email, _ := c.Locals("email").(string)

	profile, appErr := h.authSvc.GetProfile(c.Context(), userID)
	if appErr != nil {
		return handleError(c, appErr)
	}
	profile.Email = email

	return pkg.WriteSuccess(c, fiber.StatusOK, profile)
}
