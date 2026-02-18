package pkg

import "fmt"

// AppError is the standardized error type for the application.
// Services return AppError; handlers use WriteError to send JSON response.
type AppError struct {
	Code       string `json:"code"`
	Message    string `json:"message"`
	Details    any    `json:"details,omitempty"`
	HTTPStatus int    `json:"-"`
}

func (e *AppError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// WithMessage returns a copy of the error with a custom message.
func (e *AppError) WithMessage(msg string) *AppError {
	return &AppError{
		Code:       e.Code,
		Message:    msg,
		HTTPStatus: e.HTTPStatus,
	}
}

// WithDetails returns a copy of the error with field-level details.
func (e *AppError) WithDetails(details any) *AppError {
	return &AppError{
		Code:       e.Code,
		Message:    e.Message,
		Details:    details,
		HTTPStatus: e.HTTPStatus,
	}
}

// Pre-defined errors matching API contract from docs/spec/03-api-contract.json
var (
	ErrBadRequest    = &AppError{Code: "BAD_REQUEST", Message: "Malformed request", HTTPStatus: 400}
	ErrUnauthorized  = &AppError{Code: "UNAUTHORIZED", Message: "Missing or invalid authentication", HTTPStatus: 401}
	ErrForbidden     = &AppError{Code: "FORBIDDEN", Message: "Insufficient permissions", HTTPStatus: 403}
	ErrNotFound      = &AppError{Code: "NOT_FOUND", Message: "Resource not found", HTTPStatus: 404}
	ErrConflict      = &AppError{Code: "CONFLICT", Message: "Resource already exists", HTTPStatus: 409}
	ErrUnprocessable = &AppError{Code: "UNPROCESSABLE", Message: "Validation failed", HTTPStatus: 422}
	ErrRateLimited   = &AppError{Code: "RATE_LIMITED", Message: "Too many requests. Please try again later.", HTTPStatus: 429}
	ErrInternal      = &AppError{Code: "INTERNAL_ERROR", Message: "An unexpected error occurred", HTTPStatus: 500}
)
