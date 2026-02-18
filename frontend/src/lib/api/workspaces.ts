/**
 * Workspace API endpoints
 * Matches: GET/POST /api/workspaces, PUT/DELETE /api/workspaces/:id
 * See docs/spec/03-api-contract.json
 */
import { api } from './client';
import type {
	Workspace,
	WorkspaceCreateRequest,
	WorkspaceUpdateRequest,
	PaginatedResponse,
	PaginationParams
} from './types';

export type { Workspace };

export const workspacesApi = {
	/** List all workspaces the current user is a member of */
	list: (params?: PaginationParams) =>
		api.get<PaginatedResponse<Workspace>>('/workspaces', {
			params: params
				? {
						page: String(params.page ?? 1),
						per_page: String(params.per_page ?? 20)
					}
				: undefined
		}),

	/** Create a new workspace (current user becomes owner) */
	create: (data: WorkspaceCreateRequest) => api.post<Workspace>('/workspaces', data),

	/** Update workspace name/description (owner only) */
	update: (id: string, data: WorkspaceUpdateRequest) =>
		api.put<Workspace>(`/workspaces/${id}`, data),

	/** Delete workspace and all its projects/documents (owner only) */
	delete: (id: string) => api.delete(`/workspaces/${id}`)
};
