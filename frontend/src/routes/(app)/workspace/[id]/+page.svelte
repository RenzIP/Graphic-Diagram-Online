<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { page } from '$app/stores';
	import { workspacesApi } from '$lib/api/workspaces';
	import { projectsApi } from '$lib/api/projects';
	import { documentsApi } from '$lib/api/documents';
	import type { Workspace, Project, DiagramType } from '$lib/api/types';
	import { DIAGRAM_TYPES } from '$lib/utils/constants';
	import { onMount } from 'svelte';

	let workspace = $state<Workspace | null>(null);
	let loading = $state(true);
	let projects = $state<Project[]>([]);

	// Project creation
	let showNewProjectModal = $state(false);
	let newProjectName = $state('');
	let newProjectDescription = $state('');
	let creatingProject = $state(false);

	// Document creation
	let showNewDocModal = $state(false);
	let newDocProjectId = $state('');
	let newDocTitle = $state('');
	let creatingDoc = $state(false);

	function timeAgo(dateStr: string): string {
		const now = new Date();
		const date = new Date(dateStr);
		const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
		return `${Math.floor(diff / 86400)} days ago`;
	}

	onMount(async () => {
		const workspaceId = $page.params.id;
		try {
			// Fetch workspace list to find current one, and projects in parallel
			const [wsRes, projRes] = await Promise.all([
				workspacesApi.list({ per_page: 100 }),
				projectsApi.listByWorkspace(workspaceId!, { per_page: 50 })
			]);
			workspace = wsRes.data.find((w) => w.id === workspaceId) ?? null;
			projects = projRes.data;
		} catch (e) {
			console.error('Failed to load workspace:', e);
			projects = [];
		} finally {
			loading = false;
		}
	});

	async function createProject() {
		if (!newProjectName.trim()) return;
		const workspaceId = $page.params.id;
		creatingProject = true;
		try {
			const project = await projectsApi.create({
				workspace_id: workspaceId!,
				name: newProjectName.trim(),
				description: newProjectDescription.trim() || undefined
			});
			projects = [...projects, project];
			showNewProjectModal = false;
			newProjectName = '';
			newProjectDescription = '';
		} catch (e) {
			console.error('Failed to create project:', e);
		} finally {
			creatingProject = false;
		}
	}

	async function deleteProject(id: string, name: string) {
		if (!confirm(`Delete project "${name}" and all its documents?`)) return;
		try {
			await projectsApi.delete(id);
			projects = projects.filter((p) => p.id !== id);
		} catch (e) {
			console.error('Failed to delete project:', e);
		}
	}

	async function createDocument(typeId: string) {
		if (!newDocProjectId) return;
		const workspaceId = $page.params.id;
		creatingDoc = true;
		try {
			const doc = await documentsApi.create({
				workspace_id: workspaceId!,
				project_id: newDocProjectId,
				title: newDocTitle.trim() || 'Untitled',
				diagram_type: typeId as DiagramType
			});
			showNewDocModal = false;
			newDocTitle = '';
			window.location.href = `/editor/${doc.id}`;
		} catch (e) {
			console.error('Failed to create document:', e);
		} finally {
			creatingDoc = false;
		}
	}
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
					<span class="font-medium text-white">{workspace?.name ?? 'Workspace'}</span>
				</nav>
			</div>

			<div class="flex items-center gap-3">
				{#if workspace?.role === 'owner' || workspace?.role === 'editor'}
					<Button variant="primary" size="sm" onclick={() => (showNewProjectModal = true)}>
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
		<div class="flex-1 overflow-y-auto p-8">
			{#if workspace?.description}
				<p class="mb-6 text-sm text-slate-400">{workspace.description}</p>
			{/if}

			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-white">Projects</h1>
				<span class="text-sm text-slate-500"
					>{projects.length} project{projects.length !== 1 ? 's' : ''}</span
				>
			</div>

			{#if loading}
				<div class="flex items-center justify-center py-16">
					<div
						class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"
					></div>
					<span class="ml-3 text-sm text-slate-500">Loading projects...</span>
				</div>
			{:else}
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
									<div class="flex gap-1">
										<button
											class="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-indigo-400"
											title="Add document"
											onclick={(e) => {
												e.stopPropagation();
												newDocProjectId = project.id;
												showNewDocModal = true;
											}}
										>
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 4v16m8-8H4"
												/>
											</svg>
										</button>
										<button
											class="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400"
											title="Delete project"
											onclick={(e) => {
												e.stopPropagation();
												deleteProject(project.id, project.name);
											}}
										>
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</div>
								<h3
									class="mb-1 text-lg font-bold text-white transition-colors group-hover:text-indigo-400"
								>
									{project.name}
								</h3>
								{#if project.description}
									<p class="mb-2 line-clamp-2 text-sm text-slate-400">{project.description}</p>
								{/if}
								<div class="flex items-center gap-4 text-sm text-slate-500">
									<span
										>{project.document_count} document{project.document_count !== 1
											? 's'
											: ''}</span
									>
									<span>Updated {timeAgo(project.updated_at)}</span>
								</div>
							</div>
						</Card>
					{/each}

					<!-- Create New Project Card -->
					<button
						class="flex h-full min-h-[160px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-800 p-6 text-slate-500 transition-all hover:border-indigo-500/50 hover:bg-slate-900/50 hover:text-indigo-400"
						onclick={() => (showNewProjectModal = true)}
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
			{/if}
		</div>
	</main>
</div>

<!-- New Project Modal -->
<Modal bind:open={showNewProjectModal}>
	<div class="p-6">
		<h3 class="mb-4 text-lg font-semibold text-white">Create New Project</h3>
		<form
			class="space-y-3"
			onsubmit={(e) => {
				e.preventDefault();
				createProject();
			}}
		>
			<Input label="Project Name" placeholder="My Project" bind:value={newProjectName} />
			<div>
				<label for="proj-desc" class="mb-1 block text-sm text-slate-400"
					>Description (optional)</label
				>
				<textarea
					id="proj-desc"
					bind:value={newProjectDescription}
					rows={3}
					placeholder="What is this project about?"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
				></textarea>
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="ghost" size="sm" onclick={() => (showNewProjectModal = false)}
					>Cancel</Button
				>
				<Button
					variant="primary"
					size="sm"
					type="submit"
					disabled={creatingProject || !newProjectName.trim()}
				>
					{creatingProject ? 'Creating...' : 'Create Project'}
				</Button>
			</div>
		</form>
	</div>
</Modal>

<!-- New Document in Project Modal -->
<Modal bind:open={showNewDocModal}>
	<div class="p-6">
		<h3 class="mb-4 text-lg font-semibold text-white">Create Document</h3>
		<div class="mb-4">
			<Input label="Title" placeholder="Untitled" bind:value={newDocTitle} />
		</div>
		<div>
			<label class="mb-2 block text-sm text-slate-400">Diagram Type</label>
			<div class="grid grid-cols-3 gap-2">
				{#each DIAGRAM_TYPES as dt}
					<button
						class="flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-center transition-colors hover:border-indigo-500 hover:bg-slate-700"
						onclick={() => createDocument(dt.id)}
						disabled={creatingDoc}
					>
						<span class="mb-1 text-xl">{dt.icon}</span>
						<span class="text-xs text-slate-300">{dt.name}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</Modal>
