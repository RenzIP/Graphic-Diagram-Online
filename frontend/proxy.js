import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/demo'];

export function proxy(request) {
	const { pathname } = request.nextUrl;
	const isPublic =
		PUBLIC_ROUTES.some((route) => pathname === route) ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname === '/favicon.svg' ||
		pathname === '/robots.txt';

	if (isPublic) return NextResponse.next();

	const token = request.cookies.get('auth_token')?.value;
	if (!token) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		url.searchParams.set('redirect', pathname);
		return NextResponse.redirect(url);
	}

	try {
		const payload = token.split('.')[1];
		const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
		JSON.parse(atob(normalized));
		return NextResponse.next();
	} catch {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		url.search = '';
		const response = NextResponse.redirect(url);
		response.cookies.delete('auth_token');
		return response;
	}
}

export const config = {
	matcher: ['/((?!.*\\.).*)']
};
