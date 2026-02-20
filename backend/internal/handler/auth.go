package handler

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/config"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/middleware"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
	"github.com/RenzIP/Graphic-Diagram-Online/internal/service"
)

// AuthHandler handles auth-related endpoints.
type AuthHandler struct {
	authSvc *service.AuthService
	cfg     *config.Config
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authSvc *service.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{authSvc: authSvc, cfg: cfg}
}

// ─── Google OAuth ───────────────────────────────────────

// GoogleLogin redirects the user to Google's OAuth consent screen.
func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	redirectURI := h.oauthRedirectURI(c, "google")
	url := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid%%20email%%20profile&access_type=offline&prompt=consent",
		h.cfg.GoogleClientID,
		redirectURI,
	)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

// GoogleCallback handles the OAuth callback from Google.
func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Redirect(h.cfg.FrontendURL+"/login?error=missing_code", fiber.StatusTemporaryRedirect)
	}

	redirectURI := h.oauthRedirectURI(c, "google")

	// Exchange code for tokens
	tokenResp, err := exchangeGoogleCode(code, h.cfg.GoogleClientID, h.cfg.GoogleClientSecret, redirectURI)
	if err != nil {
		log.Printf("[Auth] Google code exchange failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=exchange_failed", fiber.StatusTemporaryRedirect)
	}

	// Get user info from Google
	userInfo, err := fetchGoogleUserInfo(tokenResp.AccessToken)
	if err != nil {
		log.Printf("[Auth] Google user info failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=userinfo_failed", fiber.StatusTemporaryRedirect)
	}

	return h.completeOAuth(c, userInfo.Sub, userInfo.Email, userInfo.Name, userInfo.Picture)
}

// ─── GitHub OAuth ───────────────────────────────────────

// GitHubLogin redirects the user to GitHub's OAuth authorization page.
func (h *AuthHandler) GitHubLogin(c *fiber.Ctx) error {
	redirectURI := h.oauthRedirectURI(c, "github")
	url := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
		h.cfg.GitHubClientID,
		redirectURI,
	)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

// GitHubCallback handles the OAuth callback from GitHub.
func (h *AuthHandler) GitHubCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Redirect(h.cfg.FrontendURL+"/login?error=missing_code", fiber.StatusTemporaryRedirect)
	}

	redirectURI := h.oauthRedirectURI(c, "github")

	// Exchange code for access token
	accessToken, err := exchangeGitHubCode(code, h.cfg.GitHubClientID, h.cfg.GitHubClientSecret, redirectURI)
	if err != nil {
		log.Printf("[Auth] GitHub code exchange failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=exchange_failed", fiber.StatusTemporaryRedirect)
	}

	// Get user info from GitHub
	userInfo, err := fetchGitHubUserInfo(accessToken)
	if err != nil {
		log.Printf("[Auth] GitHub user info failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=userinfo_failed", fiber.StatusTemporaryRedirect)
	}

	// GitHub user ID is numeric — use a deterministic UUID from it
	userUUID := uuid.NewSHA1(uuid.NameSpaceURL, []byte("github:"+fmt.Sprint(userInfo.ID)))

	return h.completeOAuth(c, userUUID.String(), userInfo.Email, userInfo.Name, userInfo.AvatarURL)
}

// ─── Me ─────────────────────────────────────────────────

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

// ─── Helpers ────────────────────────────────────────────

// completeOAuth upserts the user profile, signs a JWT, and redirects to frontend.
func (h *AuthHandler) completeOAuth(c *fiber.Ctx, providerUserID, email, fullName, avatarURL string) error {
	// Parse or create user UUID
	userID, err := uuid.Parse(providerUserID)
	if err != nil {
		// If provider ID is not a UUID, generate a deterministic one
		userID = uuid.NewSHA1(uuid.NameSpaceURL, []byte(providerUserID))
	}

	// Upsert profile in MongoDB
	if appErr := h.authSvc.UpsertProfile(c.Context(), userID, email, strPtr(fullName), strPtr(avatarURL)); appErr != nil {
		log.Printf("[Auth] Upsert failed for user %s: %v", userID, appErr)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=profile_failed", fiber.StatusTemporaryRedirect)
	}

	// Sign JWT
	token, err := h.signJWT(userID, email)
	if err != nil {
		log.Printf("[Auth] JWT signing failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=token_failed", fiber.StatusTemporaryRedirect)
	}

	// Redirect to frontend callback with token
	callbackURL := fmt.Sprintf("%s/auth/callback?token=%s", h.cfg.FrontendURL, token)
	return c.Redirect(callbackURL, fiber.StatusTemporaryRedirect)
}

// signJWT creates a signed HS256 JWT with sub + email claims, valid for 7 days.
func (h *AuthHandler) signJWT(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   userID.String(),
		"email": email,
		"iat":   now.Unix(),
		"exp":   now.Add(7 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.cfg.JWTSecret))
}

// oauthRedirectURI constructs the OAuth callback URL for the given provider.
func (h *AuthHandler) oauthRedirectURI(c *fiber.Ctx, provider string) string {
	scheme := "http"
	if c.Protocol() == "https" {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s/api/auth/%s/callback", scheme, c.Hostname(), provider)
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
