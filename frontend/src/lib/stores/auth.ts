/**
 * GraDiOl — Auth Store
 * Reactive auth state management with Supabase onAuthStateChange listener.
 * Based on auth-implementation-patterns skill:
 * - Centralized auth state (user, token, loading)
 * - Auto-refresh via Supabase listener
 * - Secure logout (clear all tokens + cookies)
 * - Reactive across all components
 */
import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { authApi } from '$lib/api/auth';
import type { AuthUser } from '$lib/api/types';

// ── Types ───────────────────────────────────────────────

export interface AuthState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

// ── Store ───────────────────────────────────────────────

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null
};

const authState = writable<AuthState>(initialState);

// ── Derived stores for convenience ──────────────────────

export const currentUser = derived(authState, ($s) => $s.user);
export const isAuthenticated = derived(authState, ($s) => $s.isAuthenticated);
export const isAuthLoading = derived(authState, ($s) => $s.isLoading);

// ── Auth actions ────────────────────────────────────────

/**
 * Initialize auth listener.
 * Call once from root layout. Listens for Supabase auth state changes
 * and syncs with the backend JWT token in localStorage/cookie.
 */
export function initAuthListener(): () => void {
	// Try to load user from existing token first
	const existingToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (existingToken) {
		// We have a stored token — try to fetch the user profile
		loadUserProfile();
	} else {
		authState.update((s) => ({ ...s, isLoading: false }));
	}

	// Listen for Supabase auth state changes (sign in, sign out, token refresh)
	const {
		data: { subscription }
	} = supabase.auth.onAuthStateChange(async (event, session) => {
		if (event === 'SIGNED_OUT') {
			clearAuthData();
			authState.set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null
			});
		} else if (event === 'TOKEN_REFRESHED' && session) {
			// Supabase refreshed the token — re-sync with backend
			try {
				const result = await authApi.callback(
					{
						access_token: session.access_token,
						refresh_token: session.refresh_token
					},
					session.access_token
				);
				storeAuthData(result.token);
				authState.update((s) => ({
					...s,
					user: result.user,
					isAuthenticated: true,
					error: null
				}));
			} catch {
				// Token refresh to backend failed — don't log out, keep existing token
				console.warn('[Auth] Backend token refresh failed, keeping existing token');
			}
		}
	});

	return () => subscription.unsubscribe();
}

/**
 * Load user profile from backend using stored token.
 */
async function loadUserProfile(): Promise<void> {
	try {
		const user = await authApi.me();
		authState.set({
			user,
			isAuthenticated: true,
			isLoading: false,
			error: null
		});
	} catch {
		// Token expired or invalid — clear auth
		clearAuthData();
		authState.set({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null
		});
	}
}

/**
 * Set auth state after successful login/callback.
 * Called from the auth callback page.
 */
export function setAuthUser(user: AuthUser, token: string): void {
	storeAuthData(token);
	authState.set({
		user,
		isAuthenticated: true,
		isLoading: false,
		error: null
	});
}

/**
 * Logout — clear everything and sign out of Supabase.
 */
export async function logout(): Promise<void> {
	authState.update((s) => ({ ...s, isLoading: true }));
	try {
		await supabase.auth.signOut();
	} catch {
		// Even if Supabase signout fails, clear local state
	}
	clearAuthData();
	authState.set({
		user: null,
		isAuthenticated: false,
		isLoading: false,
		error: null
	});
}

// ── Helpers ─────────────────────────────────────────────

function storeAuthData(token: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem('auth_token', token);
	// Set cookie for SSR auth guard — SameSite=Lax for OAuth redirects, Secure in prod
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
}

function clearAuthData(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem('auth_token');
	document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}

// Export the store for subscription
export const authStore = {
	subscribe: authState.subscribe
};
