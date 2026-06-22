package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// JSONB stores opaque JSON data in PostgreSQL jsonb columns.
type JSONB json.RawMessage

func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return []byte(j), nil
}

func (j *JSONB) Scan(value any) error {
	if value == nil {
		*j = JSONB("null")
		return nil
	}

	switch v := value.(type) {
	case []byte:
		*j = append((*j)[0:0], v...)
		return nil
	case string:
		*j = append((*j)[0:0], v...)
		return nil
	default:
		return fmt.Errorf("unsupported JSONB scan type %T", value)
	}
}

func (j JSONB) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return []byte(j), nil
}

func (j *JSONB) UnmarshalJSON(data []byte) error {
	*j = append((*j)[0:0], data...)
	return nil
}

// Document mirrors the documents table.
// content and view are stored as json.RawMessage (opaque JSON pass-through).
type Document struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID   *uuid.UUID `json:"project_id" gorm:"type:uuid"`
	WorkspaceID uuid.UUID  `json:"workspace_id" gorm:"type:uuid;not null"`
	Title       string     `json:"title" gorm:"not null"`
	DiagramType string     `json:"diagram_type" gorm:"not null"`
	Content     JSONB      `json:"content" gorm:"type:jsonb;not null"`
	View        JSONB      `json:"view" gorm:"type:jsonb;not null"`
	Version     int        `json:"version"`
	CreatedBy   *uuid.UUID `json:"created_by" gorm:"type:uuid"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
