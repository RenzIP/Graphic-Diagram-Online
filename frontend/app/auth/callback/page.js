'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { setAuthToken } from '../../../lib/stores/auth.js';

function AuthCallbackContent() {
	const searchParams = useSearchParams();
	const [message, setMessage] = useState('Completing sign in...');

	useEffect(() => {
		const token = searchParams.get('token');
		const error = searchParams.get('error');
		const redirectTo = searchParams.get('redirect') || '/dashboard';

		if (error) {
			window.location.href = `/login?error=${encodeURIComponent(error)}`;
			return;
		}
		if (!token) {
			window.location.href = '/login?error=Missing authentication token';
			return;
		}

		setAuthToken(token)
			.then(() => {
				const secure = window.location.protocol === 'https:' ? '; Secure' : '';
				localStorage.setItem('auth_token', token);
				document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
				window.location.href = redirectTo;
			})
			.catch(() => {
				setMessage('Authentication failed. Redirecting...');
				window.location.href = '/login?error=Authentication failed';
			});
	}, [searchParams]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
			<div className="text-center">
				<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div>
				<p>{message}</p>
			</div>
		</div>
	);
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={null}>
			<AuthCallbackContent />
		</Suspense>
	);
}
