package dto

type AuthCallbackReq struct {
	AccessToken  string `json:"access_token" validate:"required"`
	RefreshToken string `json:"refresh_token"`
}

type RegisterReq struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6,max=72"`
	Role     string `json:"role" validate:"omitempty,oneof=admin user"`
}

type LoginReq struct {
	Identifier string `json:"identifier" validate:"required"`
	Password   string `json:"password" validate:"required"`
}

type ChangePasswordReq struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6,max=72"`
}

type AuthCallbackResp struct {
	Token string       `json:"token"`
	User  AuthUserResp `json:"user"`
}

type AuthUserResp struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type AuthMeResp = AuthUserResp
