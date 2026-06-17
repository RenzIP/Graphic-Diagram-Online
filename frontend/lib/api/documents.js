import { api } from "./client";
const documentsApi = {
  /** List documents in a project (metadata only, no content/view) */
  listByProject: (projectId, params) => {
    const queryParams = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.per_page) queryParams.per_page = String(params.per_page);
    if (params?.diagram_type) queryParams.diagram_type = params.diagram_type;
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.sort_order) queryParams.sort_order = params.sort_order;
    return api.get(`/projects/${projectId}/documents`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : void 0
    });
  },
  /** Get a single document with full content and view */
  get: (id) => api.get(`/documents/${id}`),
  /** Create a new document */
  create: (data) => api.post("/documents", data),
  /** Update document title, content, and/or view */
  update: (id, data) => api.put(`/documents/${id}`, data),
  /** Delete a document */
  delete: (id) => api.delete(`/documents/${id}`),
  /** Get recent documents across all workspaces (limit 10) */
  recent: (limit = 10) => api.get("/documents/recent", {
    params: { limit: String(limit) }
  })
};
export {
  documentsApi
};
