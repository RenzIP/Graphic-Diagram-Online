<script lang="ts">
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentUser, logout } from '$lib/stores/auth';
	import { workspacesApi } from '$lib/api/workspaces';
	import type { Workspace } from '$lib/api/types';
	import { onMount } from 'svelte';

	let activePath = $derived($page.url.pathname);
	let workspaces = $state<Workspace[]>([]);
	let showUserMenu = $state(false);

	// Reactive user info from auth store
	let user = $derived($currentUser);
	let userInitials = $derived(
		user?.full_name
			? user.full_name
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.slice(0, 2)
			: (user?.email?.slice(0, 2).toUpperCase() ?? '??')
	);

	onMount(async () => {
		try {
			const res = await workspacesApi.list({ per_page: 50 });
			workspaces = res.data;
		} catch {
			workspaces = [];
		}
	});

	async function handleLogout() {
		await logout();
		await goto('/login');
	}

	// Workspace color palette
	const wsColors = ['indigo', 'orange', 'emerald', 'pink', 'cyan', 'amber'];
</script>

<svelte:window
	onclick={() => {
		if (showUserMenu) showUserMenu = false;
	}}
/>

<aside class="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900">
	<!-- Header -->
	<div class="flex h-16 items-center border-b border-slate-800 px-6">
		<div class="flex items-center gap-2">
			<div
				class="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
			>
				<svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
			</div>
			<span class="text-lg font-bold tracking-tight text-white">GraDiOl</span>
		</div>
	</div>

	<!-- Navigation -->
	<div class="flex-1 space-y-6 overflow-y-auto px-3 py-6">
		<div>
			<h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
				Platform
			</h3>
			<div class="space-y-1">
				<Button
					variant={activePath === '/dashboard' ? 'secondary' : 'ghost'}
					class="w-full justify-start"
					href="/dashboard"
				>
					<svg
						class="mr-3 h-4 w-4 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						/>
					</svg>
					Dashboard
				</Button>
				<Button
					variant={activePath.startsWith('/team') ? 'secondary' : 'ghost'}
					class="w-full justify-start"
					href="/team"
				>
					<svg
						class="mr-3 h-4 w-4 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
					Team Members
				</Button>
				<Button
					variant={activePath.startsWith('/settings') ? 'secondary' : 'ghost'}
					class="w-full justify-start"
					href="/settings"
				>
					<svg
						class="mr-3 h-4 w-4 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					Settings
				</Button>
			</div>
		</div>

		<div>
			<div class="mb-2 flex items-center justify-between px-3">
				<h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Workspaces</h3>
				<a
					href="/dashboard"
					class="text-slate-500 transition-colors hover:text-white"
					aria-label="Create Workspace"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</a>
			</div>
			<div class="space-y-1">
				{#if workspaces.length === 0}
					<p class="px-3 text-xs text-slate-600">No workspaces yet</p>
				{:else}
					{#each workspaces as ws, i}
						<Button
							variant={activePath === `/workspace/${ws.id}` ? 'secondary' : 'ghost'}
							class="w-full justify-start pl-3 text-sm"
							href={`/workspace/${ws.id}`}
						>
							<span
								class={`mr-3 h-2 w-2 shrink-0 rounded-full bg-${wsColors[i % wsColors.length]}-500`}
							></span>
							<span class="truncate">{ws.name}</span>
						</Button>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- User Profile -->
	<div class="border-t border-slate-800 p-4">
		<div class="relative">
			<button
				class="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800"
				onclick={() => (showUserMenu = !showUserMenu)}
			>
				<Avatar size="sm" initials={userInitials} />
				<div class="min-w-0 flex-1 text-left">
					<div class="truncate text-sm font-medium text-white">
						{user?.full_name || 'User'}
					</div>
					<div class="truncate text-xs text-slate-500">
						{user?.email || ''}
					</div>
				</div>
				<svg
					class="h-4 w-4 shrink-0 text-slate-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 9l4-4 4 4m0 6l-4 4-4-4"
					/>
				</svg>
			</button>

			{#if showUserMenu}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl"
					onclick={(e) => e.stopPropagation()}
				>
					<a
						href="/settings"
						class="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						Settings
					</a>
					<hr class="my-1 border-slate-700" />
					<button
						class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-slate-700 hover:text-red-300"
						onclick={handleLogout}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
						Sign out
					</button>
				</div>
			{/if}
		</div>
	</div>
</aside>
