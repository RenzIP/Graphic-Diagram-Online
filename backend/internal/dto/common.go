package dto

import "strconv"

// PaginationQuery holds the parsed pagination query parameters.
type PaginationQuery struct {
	Page    int `json:"page"`
	PerPage int `json:"per_page"`
}

// DefaultPagination returns a PaginationQuery with page=1, per_page=20.
func DefaultPagination() PaginationQuery {
	return PaginationQuery{Page: 1, PerPage: 20}
}

// ParsePagination parses page and per_page from raw query strings.
// Falls back to defaults if missing or invalid. Caps per_page at 100.
func ParsePagination(pageStr, perPageStr string) PaginationQuery {
	p := DefaultPagination()

	if v, err := strconv.Atoi(pageStr); err == nil && v > 0 {
		p.Page = v
	}
	if v, err := strconv.Atoi(perPageStr); err == nil && v > 0 {
		p.PerPage = v
	}
	if p.PerPage > 100 {
		p.PerPage = 100
	}
	return p
}

// Offset returns the SQL offset for the current page.
func (p PaginationQuery) Offset() int {
	return (p.Page - 1) * p.PerPage
}

// PaginationMeta is the pagination metadata returned in list responses.
type PaginationMeta struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// NewPaginationMeta creates a PaginationMeta from pagination query and total count.
func NewPaginationMeta(pq PaginationQuery, total int) PaginationMeta {
	totalPages := 0
	if pq.PerPage > 0 {
		totalPages = (total + pq.PerPage - 1) / pq.PerPage
	}
	return PaginationMeta{
		Page:       pq.Page,
		PerPage:    pq.PerPage,
		Total:      total,
		TotalPages: totalPages,
	}
}
