/**
 * GraDiOl — Server Hooks
 * Route guard: redirect unauthenticated users to /login
 * Session handling via JWT cookie + localStorage token
 */
import { redirect, type Handle } from '@sveltejs/kit';

/** Routes that don't require authentication */
const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/demo'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Skip auth check for public routes, static assets, and API routes
	const isPublic =
		PUBLIC_ROUTES.some((route) => pathname === route) ||
		pathname.startsWith('/_app') ||
		pathname.startsWith('/api');

	if (!isPublic) {
		// Check for auth token in cookies (set by auth callback)
		const token = event.cookies.get('auth_token');

		if (!token) {
			// No token → redirect to login
			throw redirect(303, `/login?redirect=${encodeURIComponent(pathname)}`);
		}

		// Store token in locals for downstream use
		event.locals.accessToken = token;

		// Extract user ID from JWT payload (base64-decode the payload part)
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			event.locals.userId = payload.sub;
		} catch {
			// Invalid JWT format — clear cookie and redirect
			event.cookies.delete('auth_token', { path: '/' });
			throw redirect(303, '/login');
		}
	}

	return resolve(event);
};
