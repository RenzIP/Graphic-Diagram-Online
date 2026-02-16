/**
 * Project API endpoints
 * Matches backend: GET /api/workspaces/:id/projects, POST/PUT/DELETE /api/projects
 */
import { api } from './client';

export interface Project {
    id: string;
    workspace_id: string;
    name: string;
    created_at: string;
    document_count?: number;
}

export interface ProjectCreate {
    workspace_id: string;
    name: string;
}

export const projectsApi = {
    listByWorkspace: (workspaceId: string) =>
        api.get<Project[]>(`/workspaces/${workspaceId}/projects`),
    create: (data: ProjectCreate) => api.post<Project>('/projects', data),
    update: (id: string, data: Partial<ProjectCreate>) =>
        api.put<Project>(`/projects/${id}`, data),
    delete: (id: string) => api.delete(`/projects/${id}`)
};
