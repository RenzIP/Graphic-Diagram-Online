package dto

// AuthCallbackReq is the body for POST /api/auth/callback.
type AuthCallbackReq struct {
	AccessToken  string `json:"access_token"  validate:"required"`
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// RegisterReq is the body for POST /api/register.
type RegisterReq struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6,max=72"`
	Role     string `json:"role" validate:"omitempty,oneof=admin user"`
}

// LoginReq is the body for POST /api/login.
type LoginReq struct {
	Identifier string `json:"identifier" validate:"required"`
	Password   string `json:"password" validate:"required"`
}

// ChangePasswordReq is the body for POST /api/change-password.
type ChangePasswordReq struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6,max=72"`
}

// AuthCallbackResp is the response for POST /api/auth/callback.
type AuthCallbackResp struct {
	Token string       `json:"token"`
	User  AuthUserResp `json:"user"`
}

// AuthUserResp represents a user in auth-related responses.
type AuthUserResp struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

// AuthMeResp is the response for GET /api/auth/me.
type AuthMeResp = AuthUserResp
