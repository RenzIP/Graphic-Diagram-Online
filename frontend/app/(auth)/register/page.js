'use client';

import { useState } from 'react';
import Button from '../../../components/ui/Button.js';
import Card from '../../../components/ui/Card.js';
import { authApi } from '../../../lib/api/auth.js';

export default function RegisterPage() {
	const [loading, setLoading] = useState(false);

	function signUpWithGoogle() {
		setLoading(true);
		window.location.href = authApi.getGoogleLoginUrl();
	}

	function signUpWithGitHub() {
		setLoading(true);
		window.location.href = authApi.getGitHubLoginUrl();
	}

	return (
		<Card className="p-8">
			<div className="mb-8 text-center">
				<h2 className="text-2xl font-bold text-white">Create an account</h2>
				<p className="mt-2 text-slate-400">Start building professional diagrams today</p>
			</div>
			<div className="space-y-4">
				<Button variant="outline" className="relative w-full justify-center border-none bg-white font-medium text-slate-900 hover:bg-gray-50" onClick={signUpWithGoogle} disabled={loading}>{loading ? 'Signing up...' : 'Sign up with Google'}</Button>
				<Button variant="outline" className="relative w-full justify-center border-slate-700 bg-slate-800 font-medium text-white hover:bg-slate-700" onClick={signUpWithGitHub} disabled={loading}>{loading ? 'Signing up...' : 'Sign up with GitHub'}</Button>
			</div>
			<div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div></div>
			<div className="text-center text-xs text-slate-500">
				By signing up, you agree to our <a href="#terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and <a href="#privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
			</div>
			<div className="mt-6 text-center text-sm text-slate-400">
				Already have an account? <a href="/login" className="font-bold text-indigo-400 hover:text-indigo-300">Log in</a>
			</div>
		</Card>
	);
}
