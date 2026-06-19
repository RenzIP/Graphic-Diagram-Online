<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { workspacesApi } from '$lib/api/workspaces';
	import { projectsApi } from '$lib/api/projects';
	import type { Workspace, Project } from '$lib/api/types';
	import { onMount } from 'svelte';
	import { formatDateTime, truncateMiddle } from '$lib/utils/formatters';
	import { showToast } from '$lib/utils/toast';
	import { getApiErrorMessage } from '$lib/utils/validation';

	let workspace = $state<Workspace | null>(null);
	let loading = $state(true);
	let projects = $state<Project[]>([]);
	let searchQuery = $state('');
	let filterMode = $state<'all' | 'with-documents' | 'without-documents'>('all');
	let sortMode = $state<'updated-desc' | 'name-asc' | 'docs-desc'>('updated-desc');

	onMount(async () => {
		loadWorkspaceProjects();
	});

	async function loadWorkspaceProjects() {
		const workspaceId = $page.params.id;
		try {
			const [wsRes, projRes] = await Promise.all([
				workspacesApi.list({ per_page: 100 }),
				projectsApi.listByWorkspace(workspaceId!, { per_page: 100 })
			]);
			workspace = wsRes.data.find((item) => item.id === workspaceId) ?? null;
			projects = projRes.data;
		} catch (e) {
			showToast(getApiErrorMessage(e, 'Gagal memuat list project.'), 'error');
			projects = [];
		} finally {
			loading = false;
		}
	}

	let filteredProjects = $derived(
		[...projects]
			.filter((project) => {
				const matchesSearch =
					project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
					project.id.toLowerCase().includes(searchQuery.toLowerCase());

				const matchesFilter =
					filterMode === 'all' ||
					(filterMode === 'with-documents' && project.document_count > 0) ||
					(filterMode === 'without-documents' && project.document_count === 0);

				return matchesSearch && matchesFilter;
			})
			.sort((left, right) => {
				if (sortMode === 'name-asc') {
					return left.name.localeCompare(right.name);
				}

				if (sortMode === 'docs-desc') {
					return right.document_count - left.document_count;
				}

				return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
			})
	);

	function openProjectCreate() {
		goto(`/workspace/${$page.params.id}/projects/create`);
	}

	function openProjectDetail(projectId: string) {
		goto(`/workspace/${$page.params.id}/projects/${projectId}`);
	}
</script>

<div class="flex h-screen overflow-hidden bg-background text-text-primary font-inter">
	<AppSidebar />

	<main class="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
		<!-- Header -->
		<header
			class="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/80 px-8 backdrop-blur-xl"
		>
			<div class="flex items-center gap-4">
				<nav class="flex items-center text-sm text-text-secondary">
					<a href="/dashboard" class="transition-colors hover:text-white">Dashboard</a>
					<svg class="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
					<span class="font-medium text-white font-outfit">{workspace?.name ?? 'Workspace'}</span>
				</nav>
			</div>

			<div class="flex items-center gap-3">
				{#if workspace?.role === 'owner' || workspace?.role === 'editor'}
					<Button variant="primary" size="sm" onclick={openProjectCreate}>
						<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						New Project
					</Button>
				{/if}
			</div>
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
			{#if workspace?.description}
				<p class="mb-6 text-sm text-text-secondary max-w-3xl">{workspace.description}</p>
			{/if}

			<div class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
				<div>
					<h1 class="text-2xl font-bold text-white tracking-tight font-outfit">Project List</h1>
					<p class="mt-1 text-sm text-text-tertiary">
						Manage your workspace projects and their documents.
					</p>
				</div>
				<div class="grid gap-3 sm:grid-cols-3 xl:w-[42rem]">
					<input
						type="search"
						placeholder="Search projects..."
						bind:value={searchQuery}
						class="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white placeholder-text-tertiary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors"
					/>
					<select
						bind:value={filterMode}
						class="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors appearance-none"
					>
						<option value="all" class="bg-surface">All Projects</option>
						<option value="with-documents" class="bg-surface">Has Documents</option>
						<option value="without-documents" class="bg-surface">No Documents</option>
					</select>
					<select
						bind:value={sortMode}
						class="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors appearance-none"
					>
						<option value="updated-desc" class="bg-surface">Recently Updated</option>
						<option value="name-asc" class="bg-surface">Name A-Z</option>
						<option value="docs-desc" class="bg-surface">Most Documents</option>
					</select>
				</div>
			</div>

			{#if loading}
				<div class="flex items-center justify-center py-16">
					<div
						class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary"
					></div>
					<span class="ml-3 text-sm text-text-secondary">Loading projects...</span>
				</div>
			{:else if filteredProjects.length === 0}
				<Card class="p-10 text-center border-dashed border-white/10 bg-surface/20 shadow-none">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-white/5 text-text-secondary">
						<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
							/>
						</svg>
					</div>
					<h2 class="mt-4 text-lg font-semibold text-white">No projects found</h2>
					<p class="mt-2 text-sm text-text-tertiary">
						{searchQuery || filterMode !== 'all'
							? 'Try adjusting your filters or search query.'
							: 'There are no projects in this workspace yet. Create one to get started.'}
					</p>
					{#if workspace?.role === 'owner' || workspace?.role === 'editor'}
						<div class="mt-6">
							<Button variant="primary" onclick={openProjectCreate}>Tambah Project</Button>
						</div>
					{/if}
				</Card>
			{:else}
				<div class="mb-4 rounded-xl border border-white/5 bg-surface/30 p-4 text-xs text-text-tertiary">
					Showing <span class="text-white">{filteredProjects.length}</span> of {projects.length} projects.
				</div>

				<div class="hidden overflow-hidden rounded-2xl border border-white/10 bg-surface/50 xl:block">
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-white/5">
							<thead class="bg-surface/80 text-left text-xs uppercase tracking-[0.25em] text-text-tertiary backdrop-blur-md">
								<tr>
									<th class="px-6 py-4 font-medium">ID</th>
									<th class="px-6 py-4 font-medium">Name</th>
									<th class="px-6 py-4 font-medium">Workspace</th>
									<th class="px-6 py-4 font-medium">Description</th>
									<th class="px-6 py-4 font-medium">Docs</th>
									<th class="px-6 py-4 font-medium">Created</th>
									<th class="px-6 py-4 font-medium">Updated</th>
									<th class="px-6 py-4 font-medium text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-white/5 text-sm text-text-primary bg-background/30">
								{#each filteredProjects as project}
									<tr class="hover:bg-surface/50 transition-colors group">
										<td class="px-6 py-4 font-mono text-[11px] text-text-tertiary">
											{truncateMiddle(project.id, 16)}
										</td>
										<td class="px-6 py-4 font-medium text-white group-hover:text-primary transition-colors">{project.name}</td>
										<td class="px-6 py-4 text-text-secondary">{workspace?.name ?? '-'}</td>
										<td class="max-w-[200px] px-6 py-4 text-text-tertiary truncate">
											{project.description || 'No description'}
										</td>
										<td class="px-6 py-4">
											<span class="inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-text-secondary min-w-[2rem]">
												{project.document_count}
											</span>
										</td>
										<td class="px-6 py-4 text-text-tertiary text-xs">{formatDateTime(project.created_at)}</td>
										<td class="px-6 py-4 text-text-tertiary text-xs">{formatDateTime(project.updated_at)}</td>
										<td class="px-6 py-4 text-right">
											<div class="flex flex-wrap justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button
													size="sm"
													variant="secondary"
													href={`/workspace/${$page.params.id}/projects/${project.id}`}
													class="bg-surface border-white/10 hover:bg-white/10"
												>
													View
												</Button>
												{#if workspace?.role === 'owner' || workspace?.role === 'editor'}
													<Button
														size="sm"
														variant="ghost"
														href={`/workspace/${$page.params.id}/projects/edit/${project.id}`}
														class="text-text-secondary hover:text-white"
													>
														Edit
													</Button>
												{/if}
												{#if workspace?.role === 'owner'}
													<Button
														size="sm"
														variant="ghost"
														href={`/workspace/${$page.params.id}/projects/delete/${project.id}`}
														class="text-error hover:text-white hover:bg-error/20"
													>
														Delete
													</Button>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 xl:hidden">
					{#each filteredProjects as project}
						<Card class="p-5 border-white/10 bg-surface/50 hover:border-primary/30 transition-colors">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p class="text-xs uppercase tracking-[0.3em] text-text-tertiary">
										{truncateMiddle(project.id, 16)}
									</p>
									<h3 class="mt-2 text-lg font-semibold text-white">{project.name}</h3>
								</div>
								<span class="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-medium text-text-secondary">
									{project.document_count} docs
								</span>
							</div>
							<p class="mt-3 text-sm text-text-secondary">{project.description || 'No description'}</p>
							<div class="mt-4 grid gap-2 text-[13px] text-text-tertiary sm:grid-cols-2 bg-background/50 p-3 rounded-lg">
								<p>Workspace: <span class="text-text-secondary">{workspace?.name ?? '-'}</span></p>
								<p>Created: <span class="text-text-secondary">{formatDateTime(project.created_at)}</span></p>
								<p>Updated: <span class="text-text-secondary">{formatDateTime(project.updated_at)}</span></p>
								<p>Role: <span class="text-text-secondary uppercase text-[10px] tracking-wider">{workspace?.role ?? '-'}</span></p>
							</div>
							<div class="mt-5 flex flex-wrap gap-2 pt-4 border-t border-white/5">
								<Button
									size="sm"
									variant="secondary"
									onclick={() => openProjectDetail(project.id)}
									class="bg-background border-white/10"
								>
									View Details
								</Button>
								{#if workspace?.role === 'owner' || workspace?.role === 'editor'}
									<Button
										size="sm"
										variant="ghost"
										href={`/workspace/${$page.params.id}/projects/edit/${project.id}`}
									>
										Edit
									</Button>
								{/if}
								{#if workspace?.role === 'owner'}
									<Button
										size="sm"
										variant="ghost"
										href={`/workspace/${$page.params.id}/projects/delete/${project.id}`}
										class="text-error hover:text-white hover:bg-error/20"
									>
										Delete
									</Button>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>
