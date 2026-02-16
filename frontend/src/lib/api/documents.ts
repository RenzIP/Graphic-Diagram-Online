/**
 * Document API endpoints
 * Matches backend: GET /api/projects/:id/documents, POST/GET/PUT/DELETE /api/documents
 */
import { api } from './client';
import type { DocumentState } from '$lib/stores/document';

export type DiagramType = 'flowchart' | 'erd' | 'usecase' | 'sequence' | 'mindmap' | 'custom';

export interface DocumentMeta {
    id: string;
    project_id: string;
    title: string;
    diagram_type: DiagramType;
    version: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentFull extends DocumentMeta {
    content: DocumentState;
    view: {
        positions: Record<string, { x: number; y: number }>;
        styles: Record<string, Record<string, any>>;
        routing: Record<string, any>;
    };
}

export interface DocumentCreate {
    project_id: string;
    title: string;
    diagram_type: DiagramType;
    content?: DocumentState;
}

export const documentsApi = {
    listByProject: (projectId: string) =>
        api.get<DocumentMeta[]>(`/projects/${projectId}/documents`),
    create: (data: DocumentCreate) => api.post<DocumentFull>('/documents', data),
    get: (id: string) => api.get<DocumentFull>(`/documents/${id}`),
    update: (id: string, data: Partial<DocumentFull>) =>
        api.put<DocumentFull>(`/documents/${id}`, data),
    delete: (id: string) => api.delete(`/documents/${id}`)
};
