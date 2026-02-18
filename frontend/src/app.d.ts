// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Supabase access token (JWT) from cookie or header */
			accessToken?: string;
			/** User ID extracted from Supabase JWT sub claim */
			userId?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
