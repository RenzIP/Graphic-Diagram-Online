/**
 * Auth API endpoints
 * Supports credential auth when the backend provides it, while keeping OAuth fallback.
 */
import { ApiError, api } from './client';
import type { AuthSessionResponse, AuthUser, LoginRequest, RegisterRequest } from './types';

export type { AuthUser };

/** Backend API base URL for constructing OAuth redirect URLs */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const LOGIN_ENDPOINTS = ['/auth/login', '/login'];
const REGISTER_ENDPOINTS = ['/auth/register', '/register'];

function normalizeAuthSession(payload: any): AuthSessionResponse {
	const token = payload?.token ?? payload?.access_token ?? payload?.data?.token;
	const user = payload?.user ?? payload?.data?.user ?? payload?.profile;

	if (!token || !user) {
		throw new ApiError(500, 'Response autentikasi backend tidak lengkap.');
	}

	return {
		token,
		user
	};
}

async function postToFirstAvailable<TBody>(
	endpoints: string[],
	body: TBody
): Promise<AuthSessionResponse | null> {
	let lastError: unknown = null;

	for (const endpoint of endpoints) {
		try {
			const response = await api.post<any>(endpoint, body);
			return normalizeAuthSession(response);
		} catch (error) {
			lastError = error;
			if (error instanceof ApiError && error.status === 404) {
				continue;
			}
			throw error;
		}
	}

	if (lastError instanceof ApiError && lastError.status === 404) {
		throw new ApiError(
			404,
			'Backend saat ini belum menyediakan endpoint login/register berbasis credential.'
		);
	}

	return null;
}

export const authApi = {
	/** Get current authenticated user's profile */
	me: () => api.get<AuthUser>('/auth/me'),

	/** Login with email/password JWT flow when available */
	login: (payload: LoginRequest) => postToFirstAvailable(LOGIN_ENDPOINTS, payload),

	/** Register with email/password JWT flow when available */
	register: (payload: RegisterRequest) => postToFirstAvailable(REGISTER_ENDPOINTS, payload),

	/** Get the URL to redirect to for Google OAuth login */
	getGoogleLoginUrl: () => `${API_BASE}/api/auth/google`,

	/** Get the URL to redirect to for GitHub OAuth login */
	getGitHubLoginUrl: () => `${API_BASE}/api/auth/github`
};
