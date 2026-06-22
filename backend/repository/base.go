package repository

import (
	"errors"

	"gorm.io/gorm"

	"github.com/RenzIP/Graphic-Diagram-Online/pkg"
)

func handleGormError(err error, entityName string) *pkg.AppError {
	if err == nil {
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return pkg.ErrNotFound.WithMessage(entityName + " not found")
	}
	return pkg.ErrInternal.WithMessage("database error").WithDetails(err.Error())
}
