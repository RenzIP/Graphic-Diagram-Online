/**
 * Workspace API endpoints
 * Matches backend: GET/POST /api/workspaces, PUT/DELETE /api/workspaces/:id
 */
import { api } from './client';

export interface Workspace {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
    member_count?: number;
}

export interface WorkspaceCreate {
    name: string;
}

export const workspacesApi = {
    list: () => api.get<Workspace[]>('/workspaces'),
    create: (data: WorkspaceCreate) => api.post<Workspace>('/workspaces', data),
    update: (id: string, data: Partial<WorkspaceCreate>) =>
        api.put<Workspace>(`/workspaces/${id}`, data),
    delete: (id: string) => api.delete(`/workspaces/${id}`)
};
