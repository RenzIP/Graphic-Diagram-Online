<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase, storeAuthToken } from '$lib/supabase';
	import { authApi } from '$lib/api/auth';

	let status = $state<'loading' | 'error'>('loading');
	let errorMessage = $state('');

	// Where to redirect after auth completes
	let redirectTo = $derived($page.url.searchParams.get('redirect') || '/dashboard');

	onMount(async () => {
		try {
			// Supabase PKCE: the URL contains ?code=... which Supabase auto-detects
			// because we set detectSessionInUrl: true in the client config.
			const {
				data: { session },
				error: sessionError
			} = await supabase.auth.getSession();

			if (sessionError) {
				throw new Error(sessionError.message);
			}

			if (!session) {
				// Try exchanging the code from URL params
				const code = $page.url.searchParams.get('code');
				if (code) {
					const { data, error: exchangeError } =
						await supabase.auth.exchangeCodeForSession(code);
					if (exchangeError) throw new Error(exchangeError.message);
					if (!data.session) throw new Error('No session returned after code exchange');

					await registerWithBackend(data.session.access_token, data.session.refresh_token);
				} else {
					throw new Error('No authentication code found in URL');
				}
			} else {
				await registerWithBackend(session.access_token, session.refresh_token);
			}
		} catch (err: any) {
			console.error('[Auth Callback] Error:', err);
			status = 'error';
			errorMessage = err?.message || 'Authentication failed';
		}
	});

	async function registerWithBackend(accessToken: string, refreshToken: string) {
		// POST to backend /api/auth/callback to create/update user profile
		const result = await authApi.callback({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		// Store the backend JWT token for subsequent API calls
		storeAuthToken(result.token);

		// Also set cookie for SSR auth guard (hooks.server.ts reads this)
		document.cookie = `auth_token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

		// Navigate to the target page
		await goto(redirectTo, { replaceState: true });
	}
</script>

<div
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-4"
>
	<div class="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
		<div
			class="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-indigo-600/10 blur-[100px]"
		></div>
		<div
			class="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-purple-600/10 blur-[100px] delay-1000"
		></div>
	</div>

	<div class="z-10 flex min-h-[200px] flex-col items-center justify-center text-center">
		{#if status === 'loading'}
			<div
				class="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"
			></div>
			<p class="text-lg font-medium text-white">Completing sign-in...</p>
			<p class="mt-1 text-sm text-slate-400">Please wait while we verify your account</p>
		{:else}
			<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-8 py-6">
				<svg
					class="mx-auto mb-3 h-10 w-10 text-red-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
				<p class="font-medium text-red-400">Authentication failed</p>
				<p class="mt-1 text-sm text-slate-400">{errorMessage}</p>
				<a
					href="/login"
					class="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
				>
					Try again
				</a>
			</div>
		{/if}
	</div>
</div>
