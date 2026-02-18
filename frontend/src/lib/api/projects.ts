/**
 * Project API endpoints
 * Matches: GET /api/workspaces/:id/projects, POST/PUT/DELETE /api/projects
 * See docs/spec/03-api-contract.json
 */
import { api } from './client';
import type {
	Project,
	ProjectCreateRequest,
	ProjectUpdateRequest,
	PaginatedResponse,
	PaginationParams
} from './types';

export type { Project };

export const projectsApi = {
	/** List all projects in a workspace */
	listByWorkspace: (workspaceId: string, params?: PaginationParams) =>
		api.get<PaginatedResponse<Project>>(`/workspaces/${workspaceId}/projects`, {
			params: params
				? {
						page: String(params.page ?? 1),
						per_page: String(params.per_page ?? 20)
					}
				: undefined
		}),

	/** Create a new project in a workspace */
	create: (data: ProjectCreateRequest) => api.post<Project>('/projects', data),

	/** Update project name/description */
	update: (id: string, data: ProjectUpdateRequest) => api.put<Project>(`/projects/${id}`, data),

	/** Delete project and cascade-delete all documents */
	delete: (id: string) => api.delete(`/projects/${id}`)
};
