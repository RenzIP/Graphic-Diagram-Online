/**
 * Auth API endpoints
 * Matches: POST /api/auth/callback
 */
import { api } from './client';

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export const authApi = {
    /** OAuth callback handler */
    callback: (provider: string, code: string) =>
        api.post<AuthResponse>('/auth/callback', { provider, code }),

    /** Get current user profile (mock) */
    me: () => api.get<AuthUser>('/auth/me')
};
