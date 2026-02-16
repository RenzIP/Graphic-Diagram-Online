<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { page } from '$app/stores';

	let workspaceName = $state('Team Alpha');
	let projects = [
		{ id: '1', name: 'Q1 Roadmap', docs: 5, updated: '2 hours ago' },
		{ id: '2', name: 'Marketing Assets', docs: 12, updated: '1 day ago' },
		{ id: '3', name: 'Backend Docs', docs: 8, updated: '3 days ago' }
	];
</script>

<div class="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
	<AppSidebar />

	<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<header
			class="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8"
		>
			<div class="flex items-center gap-4">
				<nav class="flex items-center text-sm text-slate-500">
					<a href="/dashboard" class="transition-colors hover:text-white">Dashboard</a>
					<svg class="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
					<span class="font-medium text-white">{workspaceName}</span>
				</nav>
			</div>

			<div class="flex items-center gap-4">
				<div class="flex -space-x-2">
					<Avatar size="sm" initials="JD" class="border-2 border-slate-950" />
					<Avatar size="sm" initials="AL" class="border-2 border-slate-950 bg-purple-500" />
					<Avatar size="sm" initials="MK" class="border-2 border-slate-950 bg-cyan-500" />
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-800 text-xs font-medium text-slate-400"
					>
						+2
					</div>
				</div>
				<div class="h-6 w-px bg-slate-800"></div>
				<Button variant="outline" size="sm">
					<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Invite
				</Button>
			</div>
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-8">
			<div class="mb-8 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-white">Projects</h1>
				<Button variant="primary" size="sm">New Project</Button>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each projects as project}
					<Card
						class="group relative cursor-pointer overflow-hidden p-0 transition-colors hover:border-slate-600"
					>
						<div
							class="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100"
						></div>
						<div class="p-6">
							<div class="mb-4 flex items-start justify-between">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400"
								>
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
										/>
									</svg>
								</div>
								<Button variant="ghost" size="icon" class="h-8 w-8 text-slate-500 hover:text-white">
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
										/>
									</svg>
								</Button>
							</div>
							<h3
								class="mb-1 text-lg font-bold text-white transition-colors group-hover:text-indigo-400"
							>
								{project.name}
							</h3>
							<div class="flex items-center gap-4 text-sm text-slate-500">
								<span>{project.docs} documents</span>
								<span>Updated {project.updated}</span>
							</div>
						</div>
					</Card>
				{/each}

				<!-- Create New Project Card -->
				<button
					class="flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-800 p-6 text-slate-500 transition-all hover:border-indigo-500/50 hover:bg-slate-900/50 hover:text-indigo-400"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</div>
					<span class="font-medium">Create New Project</span>
				</button>
			</div>
		</div>
	</main>
</div>
