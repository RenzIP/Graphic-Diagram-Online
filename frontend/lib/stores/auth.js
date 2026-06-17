import { authApi } from '../api/auth.js';
import { createStore } from './base';

const authState = createStore({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null
});

export const authStore = authState;

export function currentUserStore() {
	return {
		subscribe(listener) {
			return authState.subscribe((s) => listener(s.user));
		},
		get() {
			return authState.get().user;
		}
	};
}

export function initAuth() {
	const existingToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (existingToken) loadUserProfile();
	else authState.update((s) => ({ ...s, isLoading: false }));
}

async function loadUserProfile() {
	try {
		const user = await authApi.me();
		authState.set({ user, isAuthenticated: true, isLoading: false, error: null });
	} catch {
		clearAuthData();
		authState.set({ user: null, isAuthenticated: false, isLoading: false, error: null });
	}
}

export async function setAuthToken(token) {
	storeAuthData(token);
	await loadUserProfile();
}

export async function logout() {
	clearAuthData();
	authState.set({ user: null, isAuthenticated: false, isLoading: false, error: null });
}

function storeAuthData(token) {
	if (typeof window === 'undefined') return;
	localStorage.setItem('auth_token', token);
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
}

function clearAuthData() {
	if (typeof window === 'undefined') return;
	localStorage.removeItem('auth_token');
	document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}
