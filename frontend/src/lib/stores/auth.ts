/**
 * GraDiOl — Auth Store
 * Reactive auth state management.
 * - Centralized auth state (user, token, loading)
 * - Secure logout (clear all tokens + cookies)
 * - Reactive across all components
 */
import { writable, derived } from 'svelte/store';
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
 * Initialize auth on app startup.
 * If a stored token exists, fetch the user profile from the backend.
 * Call once from root layout.
 */
export function initAuth(): void {
	const existingToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (existingToken) {
		loadUserProfile();
	} else {
		authState.update((s) => ({ ...s, isLoading: false }));
	}
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
 * Set auth state after successful OAuth callback.
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
 * Set auth token and load profile (used when we get a token from OAuth redirect).
 */
export async function setAuthToken(token: string): Promise<void> {
	storeAuthData(token);
	await loadUserProfile();
}

/**
 * Logout — clear everything.
 */
export async function logout(): Promise<void> {
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
