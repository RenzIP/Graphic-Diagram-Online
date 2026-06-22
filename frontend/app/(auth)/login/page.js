'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useState } from 'react';
import Button from '../../../components/ui/Button.js';
import Card from '../../../components/ui/Card.js';
import { authApi } from '../../../lib/api/auth.js';

function LoginPageContent() {
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const oauthError = searchParams.get('error');

	function signInWithGoogle() {
		setLoading(true);
		setError('');
		window.location.href = authApi.getGoogleLoginUrl();
	}

	function signInWithGitHub() {
		setLoading(true);
		setError('');
		window.location.href = authApi.getGitHubLoginUrl();
	}

	return (
		<Card className="p-8">
			<div className="mb-8 text-center">
				<h2 className="text-2xl font-bold text-white">Welcome back</h2>
				<p className="mt-2 text-slate-400">Sign in to continue to your workspace</p>
			</div>
			{oauthError || error ? <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{oauthError || error}</div> : null}
			<div className="space-y-4">
				<Button variant="outline" className="relative w-full justify-center border-none bg-white font-medium text-slate-900 hover:bg-gray-50" onClick={signInWithGoogle} disabled={loading}>{loading ? 'Signing in...' : 'Sign in with Google'}</Button>
				<Button variant="outline" className="relative w-full justify-center border-slate-700 bg-slate-800 font-medium text-white hover:bg-slate-700" onClick={signInWithGitHub} disabled={loading}>{loading ? 'Signing in...' : 'Sign in with GitHub'}</Button>
			</div>
			<div className="mt-6 text-center text-sm text-slate-400">
				Don't have an account? <a href="/register" className="font-bold text-indigo-400 hover:text-indigo-300">Sign up</a>
			</div>
		</Card>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginPageContent />
		</Suspense>
	);
}
