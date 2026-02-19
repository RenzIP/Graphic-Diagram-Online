/**
 * Auth API endpoints
 * Matches: POST /api/auth/callback, GET /api/auth/me
 * See docs/spec/03-api-contract.json
 */
import { api } from './client';
import type { AuthUser, AuthCallbackRequest, AuthCallbackResponse } from './types';

export type { AuthUser, AuthCallbackResponse };

export const authApi = {
	/**
	 * Exchange Supabase auth tokens for a backend session.
	 * Called after OAuth/Magic Link flow completes.
	 * Must pass the Supabase access_token explicitly since it's not yet in localStorage.
	 */
	callback: (data: AuthCallbackRequest, supabaseToken: string) =>
		api.post<AuthCallbackResponse>('/auth/callback', data, {
			headers: { Authorization: `Bearer ${supabaseToken}` }
		}),

	/** Get current authenticated user's profile */
	me: () => api.get<AuthUser>('/auth/me')
};
