import { api } from "./client";
const projectsApi = {
  /** List all projects in a workspace */
  listByWorkspace: (workspaceId, params) => api.get(`/workspaces/${workspaceId}/projects`, {
    params: params ? {
      page: String(params.page ?? 1),
      per_page: String(params.per_page ?? 20)
    } : void 0
  }),
  /** Create a new project in a workspace */
  create: (data) => api.post("/projects", data),
  /** Update project name/description */
  update: (id, data) => api.put(`/projects/${id}`, data),
  /** Delete project and cascade-delete all documents */
  delete: (id) => api.delete(`/projects/${id}`)
};
export {
  projectsApi
};
