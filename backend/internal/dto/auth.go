package dto

// LoginReq is the body for POST /api/auth/login.
type LoginReq struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=6,max=72"`
}

// RegisterReq is the body for POST /api/auth/register.
type RegisterReq struct {
	FullName string `json:"full_name" validate:"required,min=3,max=100"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=6,max=72"`
	Role     string `json:"role" validate:"omitempty,oneof=admin user"`
}

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
