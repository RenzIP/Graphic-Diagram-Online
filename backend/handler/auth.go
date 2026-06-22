package handler

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/RenzIP/Graphic-Diagram-Online/config"
	"github.com/RenzIP/Graphic-Diagram-Online/dto"
	"github.com/RenzIP/Graphic-Diagram-Online/middleware"
	"github.com/RenzIP/Graphic-Diagram-Online/model"
	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
	"github.com/RenzIP/Graphic-Diagram-Online/service"
)

type AuthHandler struct {
	authSvc *service.AuthService
	cfg     *config.Config
}

func NewAuthHandler(authSvc *service.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{authSvc: authSvc, cfg: cfg}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.RegisterReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	user, appErr := h.authSvc.Register(c.Context(), req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	resp, err := h.buildAuthSession(user)
	if err != nil {
		return handleError(c, pkg.ErrInternal.WithMessage("failed to sign auth token").WithDetails(err.Error()))
	}

	return pkg.WriteSuccess(c, fiber.StatusCreated, resp)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	user, appErr := h.authSvc.Login(c.Context(), req)
	if appErr != nil {
		return handleError(c, appErr)
	}

	resp, err := h.buildAuthSession(user)
	if err != nil {
		return handleError(c, pkg.ErrInternal.WithMessage("failed to sign auth token").WithDetails(err.Error()))
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, resp)
}

func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req dto.ChangePasswordReq
	if err := c.BodyParser(&req); err != nil {
		return handleError(c, pkg.ErrBadRequest.WithMessage("invalid request body"))
	}

	if appErr := h.authSvc.ChangePassword(c.Context(), userID, req); appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, fiber.Map{
		"message": "password changed successfully",
	})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	profile, appErr := h.authSvc.GetProfile(c.Context(), userID)
	if appErr != nil {
		return handleError(c, appErr)
	}

	return pkg.WriteSuccess(c, fiber.StatusOK, profile)
}

func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	redirectURI := h.oauthRedirectURI("google")
	url := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid%%20email%%20profile&access_type=offline&prompt=consent",
		h.cfg.GoogleClientID,
		redirectURI,
	)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Redirect(h.cfg.FrontendURL+"/login?error=missing_code", fiber.StatusTemporaryRedirect)
	}

	redirectURI := h.oauthRedirectURI("google")
	tokenResp, err := exchangeGoogleCode(code, h.cfg.GoogleClientID, h.cfg.GoogleClientSecret, redirectURI)
	if err != nil {
		log.Printf("[Auth] Google code exchange failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=exchange_failed", fiber.StatusTemporaryRedirect)
	}

	userInfo, err := fetchGoogleUserInfo(tokenResp.AccessToken)
	if err != nil {
		log.Printf("[Auth] Google user info failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=userinfo_failed", fiber.StatusTemporaryRedirect)
	}

	return h.completeOAuth(c, userInfo.Sub, userInfo.Email, userInfo.Name, userInfo.Picture)
}

func (h *AuthHandler) GitHubLogin(c *fiber.Ctx) error {
	redirectURI := h.oauthRedirectURI("github")
	url := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
		h.cfg.GitHubClientID,
		redirectURI,
	)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) GitHubCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Redirect(h.cfg.FrontendURL+"/login?error=missing_code", fiber.StatusTemporaryRedirect)
	}

	redirectURI := h.oauthRedirectURI("github")
	accessToken, err := exchangeGitHubCode(code, h.cfg.GitHubClientID, h.cfg.GitHubClientSecret, redirectURI)
	if err != nil {
		log.Printf("[Auth] GitHub code exchange failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=exchange_failed", fiber.StatusTemporaryRedirect)
	}

	userInfo, err := fetchGitHubUserInfo(accessToken)
	if err != nil {
		log.Printf("[Auth] GitHub user info failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=userinfo_failed", fiber.StatusTemporaryRedirect)
	}

	userUUID := uuid.NewSHA1(uuid.NameSpaceURL, []byte("github:"+fmt.Sprint(userInfo.ID)))
	return h.completeOAuth(c, userUUID.String(), userInfo.Email, userInfo.Name, userInfo.AvatarURL)
}

func (h *AuthHandler) completeOAuth(c *fiber.Ctx, providerUserID, email, fullName, avatarURL string) error {
	userID, err := uuid.Parse(providerUserID)
	if err != nil {
		userID = uuid.NewSHA1(uuid.NameSpaceURL, []byte(providerUserID))
	}

	if appErr := h.authSvc.UpsertProfile(c.Context(), userID, email, strPtr(fullName), strPtr(avatarURL)); appErr != nil {
		log.Printf("[Auth] Upsert failed for user %s: %v", userID, appErr)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=profile_failed", fiber.StatusTemporaryRedirect)
	}

	username := usernameForToken(email, fullName, userID)
	token, err := h.signJWT(userID, username, "user")
	if err != nil {
		log.Printf("[Auth] JWT signing failed: %v", err)
		return c.Redirect(h.cfg.FrontendURL+"/login?error=token_failed", fiber.StatusTemporaryRedirect)
	}

	callbackURL := fmt.Sprintf("%s/auth/callback?token=%s", h.cfg.FrontendURL, token)
	return c.Redirect(callbackURL, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) buildAuthSession(user *model.UserProfile) (*dto.AuthCallbackResp, error) {
	token, err := h.signJWT(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	return &dto.AuthCallbackResp{
		Token: token,
		User:  h.authSvc.UserResponse(user),
	}, nil
}

func (h *AuthHandler) signJWT(userID uuid.UUID, username, role string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":      userID.String(),
		"username": username,
		"role":     role,
		"iat":      now.Unix(),
		"exp":      now.Add(7 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.cfg.JWTSecret))
}

func (h *AuthHandler) oauthRedirectURI(provider string) string {
	return fmt.Sprintf("%s/api/auth/%s/callback", h.cfg.BackendURL, provider)
}

func strPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func usernameForToken(email, fullName string, userID uuid.UUID) string {
	if email != "" {
		return email
	}
	if fullName != "" {
		return fullName
	}
	return userID.String()
}
