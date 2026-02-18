/**
 * GraDiOl — Supabase Client
 * Browser-side Supabase client for auth flows.
 * Uses VITE_ env vars exposed to the client via import.meta.env.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn(
		'[GraDiOl] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth will not work.'
	);
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
		flowType: 'pkce'
	}
});

/**
 * Get the current access token from Supabase session.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
	const {
		data: { session }
	} = await supabase.auth.getSession();
	return session?.access_token ?? null;
}

/**
 * Store the access token in localStorage for the API client to use.
 */
export function storeAuthToken(token: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('auth_token', token);
	}
}

/**
 * Remove the stored auth token.
 */
export function clearAuthToken(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('auth_token');
	}
}
