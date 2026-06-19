<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { DIAGRAM_TYPES } from '$lib/utils/constants';
	import { workspacesApi } from '$lib/api/workspaces';
	import { documentsApi } from '$lib/api/documents';
	import { projectsApi } from '$lib/api/projects';
	import type { RecentDocumentItem, Workspace, DiagramType } from '$lib/api/types';
	import { onMount } from 'svelte';
	import { showToast } from '$lib/utils/toast';
	import { formatDateTime } from '$lib/utils/formatters';
	import { getApiErrorMessage } from '$lib/utils/validation';

	let searchQuery = $state('');
	
	// Modals
	let showNewDiagramModal = $state(false);
	let showNewWorkspaceModal = $state(false);
	let showNewProjectModal = $state(false);
	
	let loading = $state(true);
	let recentDocs = $state<RecentDocumentItem[]>([]);
	let workspaces = $state<Workspace[]>([]);
	let totalProjects = $state(0);
	let totalDocuments = $state(0);

	// Form states
	let newWsName = $state('');
	let newWsDescription = $state('');
	let creatingWs = $state(false);

	let selectedWorkspaceId = $state('');
	let newProjectName = $state('');
	let creatingProject = $state(false);

	let newDiagramTitle = $state('');
	let creatingDiagram = $state(false);

	const typeColors: Record<string, string> = {
		flowchart: 'accent',
		erd: 'purple',
		usecase: 'cyan'
	};

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
		try {
			const [recentRes, wsRes] = await Promise.all([
				documentsApi.recent(10),
				workspacesApi.list({ per_page: 50 })
			]);
			recentDocs = recentRes;
			workspaces = wsRes.data;
			totalDocuments = recentDocs.length;
			if (workspaces.length > 0) {
				selectedWorkspaceId = workspaces[0].id;
				const projectResponses = await Promise.all(
					workspaces.map((workspace) => projectsApi.listByWorkspace(workspace.id, { per_page: 100 }))
				);
				totalProjects = projectResponses.reduce((sum, response) => sum + response.data.length, 0);
			}
		} catch (e) {
			showToast(getApiErrorMessage(e, 'Gagal memuat data dashboard.'), 'error');
		} finally {
			loading = false;
		}
	});

	let filteredDocs = $derived(
		searchQuery
			? recentDocs.filter(
					(d) =>
						d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						d.diagram_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
						(d.workspace_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
				)
			: recentDocs
	);

	// 1. Create Workspace -> Opens Create Project Modal
	async function createWorkspace() {
		if (!newWsName.trim()) {
			showToast('Nama workspace wajib diisi.', 'error');
			return;
		}
		creatingWs = true;
		try {
			const ws = await workspacesApi.create({
				name: newWsName.trim(),
				description: newWsDescription.trim() || undefined
			});
			workspaces = [...workspaces, ws];
			selectedWorkspaceId = ws.id;
			showNewWorkspaceModal = false;
			newWsName = '';
			newWsDescription = '';
			
			// Chain to Project Creation
			showNewProjectModal = true;
		} catch (e) {
			showToast(getApiErrorMessage(e, 'Gagal membuat workspace.'), 'error');
		} finally {
			creatingWs = false;
		}
	}

	// 2. Create Project -> Immediately creates diagram and redirects to Canvas
	async function createProject() {
		if (!newProjectName.trim()) {
			showToast('Nama project wajib diisi.', 'error');
			return;
		}
		if (!selectedWorkspaceId) {
			showToast('Pilih workspace terlebih dahulu.', 'error');
			return;
		}
		creatingProject = true;
		try {
			// Create project
			const proj = await projectsApi.create({
				workspace_id: selectedWorkspaceId,
				name: newProjectName.trim(),
			});
			
			// Auto create diagram and redirect to Editor
			const doc = await documentsApi.create({
				workspace_id: selectedWorkspaceId,
				project_id: proj.id,
				title: 'Untitled Diagram',
				diagram_type: 'flowchart'
			});
			
			window.location.href = `/editor/${doc.id}`;
		} catch (e) {
			showToast(getApiErrorMessage(e, 'Gagal membuat project atau diagram.'), 'error');
			creatingProject = false;
		}
	}

	// Manual Diagram Creation
	async function createDiagram(typeId: string) {
		if (!selectedWorkspaceId) {
			showNewDiagramModal = false;
			showNewWorkspaceModal = true;
			return;
		}
		creatingDiagram = true;
		try {
			const doc = await documentsApi.create({
				workspace_id: selectedWorkspaceId,
				title: newDiagramTitle.trim() || 'Untitled',
				diagram_type: typeId as DiagramType
			});
			window.location.href = `/editor/${doc.id}`;
		} catch (e) {
			showToast(getApiErrorMessage(e, 'Gagal membuat diagram.'), 'error');
			creatingDiagram = false;
		}
	}
</script>

<div class="flex h-screen overflow-hidden bg-background text-text-primary font-inter">
	<AppSidebar />

	<main class="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
		<!-- Header -->
		<header
			class="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/80 px-8 backdrop-blur-xl"
		>
			<h1 class="text-xl font-bold text-white tracking-tight font-outfit">Dashboard</h1>
			<div class="flex w-1/3 items-center gap-4">
				<div class="relative w-full group">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<svg
							class="h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						type="text"
						placeholder="Search diagrams..."
						bind:value={searchQuery}
						class="w-full rounded-xl border border-white/10 bg-surface/50 py-2.5 pr-4 pl-10 text-sm text-white placeholder-text-tertiary shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all duration-300 hover:border-white/20"
					/>
				</div>
				<Button variant="primary" size="sm" onclick={() => (showNewDiagramModal = true)} class="whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.2)]">
					<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					New Diagram
				</Button>
			</div>
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
			<!-- Statistics -->
			<section class="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
				<Card class="p-6 bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/80 transition-all duration-300">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-primary/10 rounded-xl">
							<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
						</div>
						<p class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Workspace</p>
					</div>
					<p class="text-3xl font-bold text-white">{workspaces.length}</p>
				</Card>
				<Card class="p-6 bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/80 transition-all duration-300">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-accent/10 rounded-xl">
							<svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
						</div>
						<p class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Project</p>
					</div>
					<p class="text-3xl font-bold text-white">{totalProjects}</p>
				</Card>
				<Card class="p-6 bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/80 transition-all duration-300">
					<div class="flex items-center gap-3 mb-2">
						<div class="p-2 bg-[#06b6d4]/10 rounded-xl">
							<svg class="w-5 h-5 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
						</div>
						<p class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Documents</p>
					</div>
					<p class="text-3xl font-bold text-white">{totalDocuments}</p>
				</Card>
			</section>

			<!-- Workspaces -->
			<section class="mb-12">
				<div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div>
						<h2 class="text-lg font-semibold text-white tracking-tight font-outfit">Your Workspaces</h2>
						<p class="text-sm text-text-secondary mt-1">Manage your team's projects and diagrams.</p>
					</div>
					<Button onclick={() => (showNewWorkspaceModal = true)} variant="secondary" size="sm" class="bg-card border-white/10 hover:bg-surface">
						+ New Workspace
					</Button>
				</div>
				<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
					{#each workspaces as workspace}
						<Card class="p-6 bg-surface/30 border-white/5 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
							<div class="flex items-start justify-between gap-3">
								<div>
									<h3 class="text-base font-semibold text-white flex items-center gap-2">
										{workspace.name}
									</h3>
									<p class="mt-1.5 text-sm text-text-secondary line-clamp-2">
										{workspace.description || 'Workspace tanpa deskripsi'}
									</p>
								</div>
								<span class="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
									{workspace.role}
								</span>
							</div>
							<div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
								<div class="text-xs text-text-tertiary">
									Updated {timeAgo(workspace.updated_at)}
								</div>
								<div class="flex gap-2">
									<Button href={`/workspace/${workspace.id}`} size="sm" variant="ghost" class="text-primary hover:text-white hover:bg-primary/20">
										View
									</Button>
								</div>
							</div>
						</Card>
					{/each}
				</div>
			</section>

			<!-- Quick Start Templates -->
			<section class="mb-12">
				<h2 class="mb-5 text-lg font-semibold text-white tracking-tight font-outfit">Quick Start</h2>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
					<button
						class="group relative flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-surface/20 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1"
						onclick={() => (showNewDiagramModal = true)}
					>
						<div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20 text-primary">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
						</div>
						<span class="text-sm font-medium text-text-secondary group-hover:text-white">Blank Diagram</span>
					</button>

					{#each DIAGRAM_TYPES as template}
						<button
							class="group flex flex-col items-center rounded-xl border border-white/5 bg-surface/40 p-5 text-left transition-all duration-300 hover:border-white/20 hover:bg-surface/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
							onclick={() => createDiagram(template.id)}
						>
							<div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-card border border-white/5 text-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm">
								{template.icon}
							</div>
							<span class="text-sm font-medium text-text-secondary group-hover:text-white">{template.name}</span>
						</button>
					{/each}
				</div>
			</section>

			<!-- Recent Documents -->
			<section>
				<h2 class="mb-5 text-lg font-semibold text-white tracking-tight font-outfit">Recent Diagrams</h2>

				{#if loading}
					<div class="flex items-center justify-center py-12">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary"></div>
					</div>
				{:else if filteredDocs.length === 0}
					<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface/20 py-16">
						<div class="h-12 w-12 rounded-xl bg-card border border-white/5 flex items-center justify-center mb-4">
							<svg class="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<p class="text-sm text-text-tertiary">
							{searchQuery ? 'No diagrams match your search' : 'No diagrams yet. Create your first one above!'}
						</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each filteredDocs as doc}
							<Card
								class="group relative cursor-pointer border-white/5 bg-surface/30 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
								onclick={() => (window.location.href = `/editor/${doc.id}`)}
							>
								<div class="relative aspect-[16/10] overflow-hidden border-b border-white/5 bg-background">
									<div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 10px 10px;"></div>
									<div class={`absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300`}></div>
								</div>
								<div class="p-4">
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<h3 class="truncate font-medium text-white transition-colors group-hover:text-primary">
												{doc.title}
											</h3>
											<p class="mt-1 text-xs text-text-tertiary flex items-center gap-1.5">
												<span class="truncate max-w-[120px] inline-block">{doc.workspace_name}</span> 
												{#if doc.project_name}
													<span class="text-white/20">•</span>
													<span class="truncate max-w-[100px] inline-block">{doc.project_name}</span>
												{/if}
											</p>
										</div>
									</div>
									<div class="mt-4 flex items-center justify-between">
										<span class="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium tracking-wide text-text-secondary uppercase border border-white/5">
											{doc.diagram_type}
										</span>
										<span class="text-[11px] text-text-tertiary">{timeAgo(doc.updated_at)}</span>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</main>
</div>

<!-- New Diagram Modal -->
<Modal bind:open={showNewDiagramModal}>
	<div class="p-6">
		<h3 class="mb-5 text-lg font-semibold text-white font-outfit">Create New Diagram</h3>
		{#if workspaces.length === 0}
			<p class="mb-4 text-sm text-text-secondary bg-surface/50 p-4 rounded-xl border border-white/10">
				You need a workspace first.
				<button
					class="text-primary font-medium hover:text-primary-hover ml-1"
					onclick={() => {
						showNewDiagramModal = false;
						showNewWorkspaceModal = true;
					}}
				>
					Create one
				</button>
			</p>
		{:else}
			<div class="mb-5 space-y-4">
				<Input label="Diagram Title" placeholder="Untitled Diagram" bind:value={newDiagramTitle} />
				<div>
					<label for="ws-select" class="mb-1.5 block text-sm font-medium text-text-secondary">Workspace</label>
					<select
						id="ws-select"
						bind:value={selectedWorkspaceId}
						class="w-full rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-sm text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors appearance-none"
					>
						{#each workspaces as ws}
							<option value={ws.id}>{ws.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="mb-2">
				<p class="mb-3 block text-sm font-medium text-text-secondary">Select Diagram Type</p>
				<div class="grid grid-cols-3 gap-3">
					{#each DIAGRAM_TYPES as dt}
						<button
							class="flex flex-col items-center rounded-xl border border-white/10 bg-surface/50 p-4 text-center transition-all hover:border-primary/50 hover:bg-surface"
							onclick={() => createDiagram(dt.id)}
							disabled={creatingDiagram}
						>
							<span class="mb-2 text-2xl drop-shadow-md">{dt.icon}</span>
							<span class="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">{dt.name}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Modal>

<!-- New Workspace Modal (Step 1) -->
<Modal bind:open={showNewWorkspaceModal}>
	<div class="p-6">
		<h3 class="mb-1.5 text-lg font-semibold text-white tracking-tight font-outfit">Create Workspace</h3>
		<p class="text-sm text-text-secondary mb-5">Step 1: Create a collaborative workspace for your team.</p>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				createWorkspace();
			}}
		>
			<Input label="Workspace Name" placeholder="My Awesome Team" bind:value={newWsName} />
			<div>
				<label for="ws-desc" class="mb-1.5 block text-sm font-medium text-text-secondary">Description <span class="text-text-tertiary font-normal">(optional)</span></label>
				<textarea
					id="ws-desc"
					bind:value={newWsDescription}
					rows={3}
					placeholder="What is this workspace for?"
					class="w-full rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-sm text-white placeholder-text-tertiary shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors resize-none hover:border-white/20"
				></textarea>
			</div>
			<div class="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
				<Button variant="ghost" onclick={() => (showNewWorkspaceModal = false)}>Cancel</Button>
				<Button variant="primary" type="submit" disabled={creatingWs || !newWsName.trim()} class="px-6">
					{creatingWs ? 'Creating...' : 'Continue to Project →'}
				</Button>
			</div>
		</form>
	</div>
</Modal>

<!-- New Project Modal (Step 2) -->
<Modal bind:open={showNewProjectModal}>
	<div class="p-6">
		<h3 class="mb-1.5 text-lg font-semibold text-white tracking-tight font-outfit">Create Project</h3>
		<p class="text-sm text-text-secondary mb-5">Step 2: Create a project inside your workspace to organize diagrams.</p>
		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				createProject();
			}}
		>
			<Input label="Project Name" placeholder="Sprint 1 Design Docs" bind:value={newProjectName} />
			
			<div class="bg-surface/50 p-4 rounded-xl border border-white/10 mt-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-primary/10 rounded-xl text-primary">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
					</div>
					<div>
						<p class="text-sm font-medium text-white">Instant Setup</p>
						<p class="text-xs text-text-tertiary">An empty flowchart diagram will be created automatically.</p>
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
				<Button variant="ghost" onclick={() => (showNewProjectModal = false)}>Cancel</Button>
				<Button variant="primary" type="submit" disabled={creatingProject || !newProjectName.trim()} class="px-6">
					{creatingProject ? 'Setting up...' : 'Create & Open Editor'}
				</Button>
			</div>
		</form>
	</div>
</Modal>
