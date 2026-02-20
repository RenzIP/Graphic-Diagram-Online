/**
 * Auth API endpoints
 * Matches: GET /api/auth/me
 * OAuth is handled via backend redirects (not API calls)
 */
import { api } from './client';
import type { AuthUser } from './types';

export type { AuthUser };

/** Backend API base URL for constructing OAuth redirect URLs */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const authApi = {
	/** Get current authenticated user's profile */
	me: () => api.get<AuthUser>('/auth/me'),

	/** Get the URL to redirect to for Google OAuth login */
	getGoogleLoginUrl: () => `${API_BASE}/api/auth/google`,

	/** Get the URL to redirect to for GitHub OAuth login */
	getGitHubLoginUrl: () => `${API_BASE}/api/auth/github`
};
