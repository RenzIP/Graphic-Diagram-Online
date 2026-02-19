/**
 * GraDiOl API Client — Base fetch wrapper
 * Matches backend endpoints from README.md
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
}

class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public data?: any
	) {
		super(message);
		this.name = 'ApiError';
	}
}

function getAuthToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('auth_token');
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	const { params, ...fetchOptions } = options;

	let url = `${API_BASE_URL}${endpoint}`;
	if (params) {
		const searchParams = new URLSearchParams(params);
		url += `?${searchParams.toString()}`;
	}

	const token = getAuthToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);

		// 401 Unauthorized — token expired or invalid → redirect to login
		if (response.status === 401 && typeof window !== 'undefined') {
			localStorage.removeItem('auth_token');
			document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
			const currentPath = window.location.pathname;
			if (currentPath !== '/login' && currentPath !== '/register') {
				window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
			}
		}

		throw new ApiError(
			response.status,
			errorData?.message || `Request failed: ${response.statusText}`,
			errorData
		);
	}

	if (response.status === 204) return undefined as T;
	return response.json();
}

export const api = {
	get: <T>(endpoint: string, options?: RequestOptions) =>
		request<T>(endpoint, { ...options, method: 'GET' }),

	post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
		request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

	put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
		request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

	delete: <T>(endpoint: string, options?: RequestOptions) =>
		request<T>(endpoint, { ...options, method: 'DELETE' })
};

export { ApiError, getAuthToken, API_BASE_URL };
