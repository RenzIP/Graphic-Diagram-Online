import { api } from "./client";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const authApi = {
  /** Get current authenticated user's profile */
  me: () => api.get("/auth/me"),
  /** Get the URL to redirect to for Google OAuth login */
  getGoogleLoginUrl: () => `${API_BASE}/api/auth/google`,
  /** Get the URL to redirect to for GitHub OAuth login */
  getGitHubLoginUrl: () => `${API_BASE}/api/auth/github`
};
export {
  authApi
};
