package pkg

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

// validate is the singleton validator instance.
var validate = validator.New()

// Validate validates a struct and returns an AppError if invalid.
func Validate(s any) *AppError {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		return ErrBadRequest.WithMessage("invalid request payload")
	}

	messages := make([]string, 0, len(validationErrors))
	for _, fe := range validationErrors {
		messages = append(messages, formatFieldError(fe))
	}

	return ErrUnprocessable.
		WithMessage("validation failed").
		WithDetails(strings.Join(messages, "; "))
}

func formatFieldError(fe validator.FieldError) string {
	field := fe.Field()
	switch fe.Tag() {
	case "required":
		return field + " is required"
	case "email":
		return field + " must be a valid email"
	case "min":
		return field + " must be at least " + fe.Param() + " characters"
	case "max":
		return field + " must be at most " + fe.Param() + " characters"
	case "uuid":
		return field + " must be a valid UUID"
	case "oneof":
		return field + " must be one of: " + fe.Param()
	default:
		return field + " is invalid (" + fe.Tag() + ")"
	}
}
