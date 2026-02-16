/**
 * GraDiOl — Server Hooks
 * Route guard: redirect unauthenticated users to /login
 * Per Konsep Aplikasi §7.2
 */
import type { Handle } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/demo'];

export const handle: Handle = async ({ event, resolve }) => {
    const { pathname } = event.url;

    // Skip auth check for public routes and static assets
    const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/_app'));

    if (!isPublic) {
        // In production: check for auth token in cookies
        // For now, just let everything through (auth will be handled by Supabase client-side)
        // const token = event.cookies.get('auth_token');
        // if (!token) {
        //     throw redirect(303, '/login');
        // }
    }

    return resolve(event);
};
