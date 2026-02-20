package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/middleware"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/service"
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
// and returns the user data + token.
func (h *AuthHandler) Callback(c *fiber.Ctx) error {
	// The auth callback is called after frontend completes OAuth.
	// The JWT is already validated by the auth middleware at this point.
	userID := middleware.GetUserID(c)
	email, _ := c.Locals("email").(string)

	// Parse request body to get the access_token
	var body struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.BodyParser(&body); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("Invalid request body"))
	}

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
		"user":  profile,
		"token": body.AccessToken,
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
