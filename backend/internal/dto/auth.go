package dto

// AuthCallbackReq is the body for POST /api/auth/callback.
type AuthCallbackReq struct {
	AccessToken  string `json:"access_token"  validate:"required"`
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// AuthCallbackResp is the response for POST /api/auth/callback.
type AuthCallbackResp struct {
	Token string       `json:"token"`
	User  AuthUserResp `json:"user"`
}

// AuthUserResp represents a user in auth-related responses.
type AuthUserResp struct {
	ID        string  `json:"id"`
	Email     string  `json:"email"`
	FullName  *string `json:"full_name"`
	AvatarURL *string `json:"avatar_url"`
}

// AuthMeResp is the response for GET /api/auth/me.
type AuthMeResp = AuthUserResp
