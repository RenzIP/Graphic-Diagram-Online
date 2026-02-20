/**
 * GraDiOl — API Response Types
 * Matches backend API contract: docs/spec/03-api-contract.json
 */

// ── Pagination ──────────────────────────────────────────

export interface PaginationMeta {
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

export interface PaginationParams {
	page?: number;
	per_page?: number;
}

// ── Error ───────────────────────────────────────────────

export interface ApiErrorResponse {
	code: string;
	message: string;
	details?: Record<string, string>;
}

// ── Auth ────────────────────────────────────────────────

export interface AuthUser {
	id: string;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
}

// ── Workspace ───────────────────────────────────────────

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	owner_id: string;
	description: string | null;
	role: 'owner' | 'editor' | 'viewer';
	member_count: number;
	created_at: string;
	updated_at: string;
}

export interface WorkspaceCreateRequest {
	name: string;
	description?: string;
}

export interface WorkspaceUpdateRequest {
	name?: string;
	description?: string;
}

// ── Project ─────────────────────────────────────────────

export interface Project {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	document_count: number;
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface ProjectCreateRequest {
	workspace_id: string;
	name: string;
	description?: string;
}

export interface ProjectUpdateRequest {
	name?: string;
	description?: string;
}

// ── Document ────────────────────────────────────────────

export type DiagramType = 'flowchart' | 'erd' | 'usecase';

export interface DocumentMeta {
	id: string;
	project_id: string | null;
	workspace_id: string;
	title: string;
	diagram_type: DiagramType;
	version: number;
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface DocumentContent {
	nodes: Array<{
		id: string;
		type: string;
		label?: string;
		properties?: Record<string, unknown>;
	}>;
	edges: Array<{
		id: string;
		source: string;
		target: string;
		label?: string;
		type?: string;
	}>;
}

export interface DocumentView {
	positions: Record<string, { x: number; y: number }>;
	styles: Record<string, Record<string, unknown>>;
	routing: Record<string, unknown>;
}

export interface DocumentFull extends DocumentMeta {
	content: DocumentContent;
	view: DocumentView;
}

export interface DocumentCreateRequest {
	workspace_id: string;
	project_id?: string;
	title?: string;
	diagram_type: DiagramType;
	content?: DocumentContent;
	view?: DocumentView;
}

export interface DocumentUpdateRequest {
	title?: string;
	content?: DocumentContent;
	view?: DocumentView;
}

export interface RecentDocumentItem {
	id: string;
	title: string;
	diagram_type: DiagramType;
	workspace_id: string;
	workspace_name: string;
	project_id: string | null;
	project_name: string | null;
	updated_at: string;
}
