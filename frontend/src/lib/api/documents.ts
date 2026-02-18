/**
 * Document API endpoints
 * Matches: GET /api/projects/:id/documents, POST/GET/PUT/DELETE /api/documents
 * See docs/spec/03-api-contract.json
 */
import { api } from './client';
import type {
	DocumentMeta,
	DocumentFull,
	DocumentCreateRequest,
	DocumentUpdateRequest,
	RecentDocumentItem,
	PaginatedResponse,
	PaginationParams,
	DiagramType
} from './types';

export type { DocumentMeta, DocumentFull, DocumentCreateRequest, DiagramType };

export interface DocumentListParams extends PaginationParams {
	diagram_type?: DiagramType;
	sort_by?: 'updated_at' | 'created_at' | 'title';
	sort_order?: 'asc' | 'desc';
}

export const documentsApi = {
	/** List documents in a project (metadata only, no content/view) */
	listByProject: (projectId: string, params?: DocumentListParams) => {
		const queryParams: Record<string, string> = {};
		if (params?.page) queryParams.page = String(params.page);
		if (params?.per_page) queryParams.per_page = String(params.per_page);
		if (params?.diagram_type) queryParams.diagram_type = params.diagram_type;
		if (params?.sort_by) queryParams.sort_by = params.sort_by;
		if (params?.sort_order) queryParams.sort_order = params.sort_order;

		return api.get<PaginatedResponse<DocumentMeta>>(`/projects/${projectId}/documents`, {
			params: Object.keys(queryParams).length > 0 ? queryParams : undefined
		});
	},

	/** Get a single document with full content and view */
	get: (id: string) => api.get<DocumentFull>(`/documents/${id}`),

	/** Create a new document */
	create: (data: DocumentCreateRequest) => api.post<DocumentFull>('/documents', data),

	/** Update document title, content, and/or view */
	update: (id: string, data: DocumentUpdateRequest) =>
		api.put<DocumentFull>(`/documents/${id}`, data),

	/** Delete a document */
	delete: (id: string) => api.delete(`/documents/${id}`),

	/** Get recent documents across all workspaces (limit 10) */
	recent: (limit: number = 10) =>
		api.get<RecentDocumentItem[]>('/documents/recent', {
			params: { limit: String(limit) }
		})
};
