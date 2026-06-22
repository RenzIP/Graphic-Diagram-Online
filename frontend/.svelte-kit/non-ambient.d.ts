
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(auth)" | "/(app)" | "/" | "/auth" | "/auth/callback" | "/(app)/dashboard" | "/demo" | "/(app)/editor" | "/(app)/editor/[id]" | "/(auth)/login" | "/(auth)/register" | "/(app)/settings" | "/(app)/team" | "/(app)/workspace" | "/(app)/workspace/[id]" | "/(app)/workspace/[id]/projects" | "/(app)/workspace/[id]/projects/create" | "/(app)/workspace/[id]/projects/delete" | "/(app)/workspace/[id]/projects/delete/[projectId]" | "/(app)/workspace/[id]/projects/edit" | "/(app)/workspace/[id]/projects/edit/[projectId]" | "/(app)/workspace/[id]/projects/[projectId]";
		RouteParams(): {
			"/(app)/editor/[id]": { id: string };
			"/(app)/workspace/[id]": { id: string };
			"/(app)/workspace/[id]/projects": { id: string };
			"/(app)/workspace/[id]/projects/create": { id: string };
			"/(app)/workspace/[id]/projects/delete": { id: string };
			"/(app)/workspace/[id]/projects/delete/[projectId]": { id: string; projectId: string };
			"/(app)/workspace/[id]/projects/edit": { id: string };
			"/(app)/workspace/[id]/projects/edit/[projectId]": { id: string; projectId: string };
			"/(app)/workspace/[id]/projects/[projectId]": { id: string; projectId: string }
		};
		LayoutParams(): {
			"/(auth)": Record<string, never>;
			"/(app)": { id?: string; projectId?: string };
			"/": { id?: string; projectId?: string };
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/(app)/dashboard": Record<string, never>;
			"/demo": Record<string, never>;
			"/(app)/editor": { id?: string };
			"/(app)/editor/[id]": { id: string };
			"/(auth)/login": Record<string, never>;
			"/(auth)/register": Record<string, never>;
			"/(app)/settings": Record<string, never>;
			"/(app)/team": Record<string, never>;
			"/(app)/workspace": { id?: string; projectId?: string };
			"/(app)/workspace/[id]": { id: string; projectId?: string };
			"/(app)/workspace/[id]/projects": { id: string; projectId?: string };
			"/(app)/workspace/[id]/projects/create": { id: string };
			"/(app)/workspace/[id]/projects/delete": { id: string; projectId?: string };
			"/(app)/workspace/[id]/projects/delete/[projectId]": { id: string; projectId: string };
			"/(app)/workspace/[id]/projects/edit": { id: string; projectId?: string };
			"/(app)/workspace/[id]/projects/edit/[projectId]": { id: string; projectId: string };
			"/(app)/workspace/[id]/projects/[projectId]": { id: string; projectId: string }
		};
		Pathname(): "/" | "/auth" | "/auth/" | "/auth/callback" | "/auth/callback/" | "/dashboard" | "/dashboard/" | "/demo" | "/demo/" | "/editor" | "/editor/" | `/editor/${string}` & {} | `/editor/${string}/` & {} | "/login" | "/login/" | "/register" | "/register/" | "/settings" | "/settings/" | "/team" | "/team/" | "/workspace" | "/workspace/" | `/workspace/${string}` & {} | `/workspace/${string}/` & {} | `/workspace/${string}/projects` & {} | `/workspace/${string}/projects/` & {} | `/workspace/${string}/projects/create` & {} | `/workspace/${string}/projects/create/` & {} | `/workspace/${string}/projects/delete` & {} | `/workspace/${string}/projects/delete/` & {} | `/workspace/${string}/projects/delete/${string}` & {} | `/workspace/${string}/projects/delete/${string}/` & {} | `/workspace/${string}/projects/edit` & {} | `/workspace/${string}/projects/edit/` & {} | `/workspace/${string}/projects/edit/${string}` & {} | `/workspace/${string}/projects/edit/${string}/` & {} | `/workspace/${string}/projects/${string}` & {} | `/workspace/${string}/projects/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}