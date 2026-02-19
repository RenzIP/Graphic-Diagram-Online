<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { DIAGRAM_TYPES } from '$lib/utils/constants';
	import { workspacesApi } from '$lib/api/workspaces';
	import { documentsApi } from '$lib/api/documents';
	import type { RecentDocumentItem, Workspace, DiagramType } from '$lib/api/types';
	import { onMount } from 'svelte';

	let searchQuery = $state('');
	let showNewDiagramModal = $state(false);
	let showNewWorkspaceModal = $state(false);
	let loading = $state(true);
	let recentDocs = $state<RecentDocumentItem[]>([]);
	let workspaces = $state<Workspace[]>([]);

	// New workspace form
	let newWsName = $state('');
	let newWsDescription = $state('');
	let creatingWs = $state(false);

	// New diagram form
	let selectedWorkspaceId = $state('');
	let newDiagramTitle = $state('');
	let creatingDiagram = $state(false);

	const typeColors: Record<string, string> = {
		flowchart: 'indigo',
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
			// Fetch recent documents and workspaces in parallel
			const [recentRes, wsRes] = await Promise.all([
				documentsApi.recent(10),
				workspacesApi.list({ per_page: 50 })
			]);
			recentDocs = recentRes;
			workspaces = wsRes.data;
			if (workspaces.length > 0) {
				selectedWorkspaceId = workspaces[0].id;
			}
		} catch (e) {
			console.error('Failed to load dashboard data:', e);
			recentDocs = [];
			workspaces = [];
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

	async function createDiagram(typeId: string) {
		if (!selectedWorkspaceId) {
			// If no workspace exists, prompt to create one first
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
			showNewDiagramModal = false;
			newDiagramTitle = '';
			window.location.href = `/editor/${doc.id}`;
		} catch (e) {
			console.error('Failed to create diagram:', e);
		} finally {
			creatingDiagram = false;
		}
	}

	async function createWorkspace() {
		if (!newWsName.trim()) return;
		creatingWs = true;
		try {
			const ws = await workspacesApi.create({
				name: newWsName.trim(),
				description: newWsDescription.trim() || undefined
			});
			workspaces = [...workspaces, ws];
			if (!selectedWorkspaceId) selectedWorkspaceId = ws.id;
			showNewWorkspaceModal = false;
			newWsName = '';
			newWsDescription = '';
		} catch (e) {
			console.error('Failed to create workspace:', e);
		} finally {
			creatingWs = false;
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
			<h1 class="text-xl font-bold text-white">Dashboard</h1>
			<div class="flex w-1/3 items-center gap-4">
				<div class="relative w-full">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<svg
							class="h-4 w-4 text-slate-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<input
						type="text"
						placeholder="Search diagrams..."
						bind:value={searchQuery}
						class="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
					/>
				</div>
				<Button variant="primary" size="sm" onclick={() => (showNewDiagramModal = true)}>
					<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Diagram
				</Button>
			</div>
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-8">
			<!-- Templates Section -->
			<section class="mb-12">
				<h2 class="mb-4 text-lg font-semibold text-white">Start from template</h2>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
					<button
						class="group flex flex-col items-center rounded-xl border border-dashed border-slate-700 p-4 text-left transition-colors hover:border-indigo-500 hover:bg-slate-900"
						onclick={() => (showNewDiagramModal = true)}
					>
						<div
							class="mb-3 flex aspect-video w-full items-center justify-center rounded-lg bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20"
						>
							<svg
								class="h-8 w-8 text-indigo-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</div>
						<span class="text-sm font-medium text-slate-300 group-hover:text-white"
							>Blank Diagram</span
						>
					</button>

					{#each DIAGRAM_TYPES as template}
						<button
							class="group flex flex-col items-center rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition-colors hover:border-slate-600"
							onclick={() => createDiagram(template.id)}
						>
							<div
								class="relative mb-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-slate-800"
							>
								<span class="text-2xl opacity-40 transition-opacity group-hover:opacity-70"
									>{template.icon}</span
								>
							</div>
							<span class="text-sm font-medium text-slate-300 group-hover:text-white"
								>{template.name}</span
							>
						</button>
					{/each}
				</div>
			</section>

			<!-- Recent Documents -->
			<section>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-white">Recent Diagrams</h2>
				</div>

				{#if loading}
					<div class="flex items-center justify-center py-12">
						<div
							class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"
						></div>
						<span class="ml-3 text-sm text-slate-500">Loading diagrams...</span>
					</div>
				{:else if filteredDocs.length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-16"
					>
						<svg
							class="mb-4 h-12 w-12 text-slate-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<p class="text-sm text-slate-500">
							{searchQuery
								? 'No diagrams match your search'
								: 'No diagrams yet. Create your first one above!'}
						</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each filteredDocs as doc}
							<Card
								class="group relative cursor-pointer transition-colors hover:border-slate-600"
								onclick={() => (window.location.href = `/editor/${doc.id}`)}
							>
								<div
									class="relative aspect-video overflow-hidden border-b border-slate-800 bg-slate-900"
								>
									<div
										class={`absolute inset-0 bg-${typeColors[doc.diagram_type] || 'slate'}-500/5 group-hover:bg-${typeColors[doc.diagram_type] || 'slate'}-500/10 transition-colors`}
									></div>
								</div>
								<div class="p-4">
									<div class="flex items-start justify-between">
										<div class="min-w-0 flex-1">
											<h3
												class="truncate font-medium text-slate-200 transition-colors group-hover:text-indigo-400"
											>
												{doc.title}
											</h3>
											<p class="mt-1 text-xs text-slate-500">
												{doc.workspace_name}{doc.project_name ? ` / ${doc.project_name}` : ''} · {timeAgo(
													doc.updated_at
												)}
											</p>
										</div>
										<span
											class="ml-2 shrink-0 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-400 uppercase"
										>
											{doc.diagram_type}
										</span>
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
		<h3 class="mb-4 text-lg font-semibold text-white">Create New Diagram</h3>
		{#if workspaces.length === 0}
			<p class="mb-4 text-sm text-slate-400">
				You need a workspace first.
				<button
					class="text-indigo-400 hover:text-indigo-300"
					onclick={() => {
						showNewDiagramModal = false;
						showNewWorkspaceModal = true;
					}}
				>
					Create one
				</button>
			</p>
		{:else}
			<div class="mb-4 space-y-3">
				<Input label="Title" placeholder="Untitled" bind:value={newDiagramTitle} />
				<div>
					<label for="ws-select" class="mb-1 block text-sm text-slate-400">Workspace</label>
					<select
						id="ws-select"
						bind:value={selectedWorkspaceId}
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
					>
						{#each workspaces as ws}
							<option value={ws.id}>{ws.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="mb-4">
				<label class="mb-2 block text-sm text-slate-400">Diagram Type</label>
				<div class="grid grid-cols-3 gap-2">
					{#each DIAGRAM_TYPES as dt}
						<button
							class="flex flex-col items-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-center transition-colors hover:border-indigo-500 hover:bg-slate-700"
							onclick={() => createDiagram(dt.id)}
							disabled={creatingDiagram}
						>
							<span class="mb-1 text-xl">{dt.icon}</span>
							<span class="text-xs text-slate-300">{dt.name}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Modal>

<!-- New Workspace Modal -->
<Modal bind:open={showNewWorkspaceModal}>
	<div class="p-6">
		<h3 class="mb-4 text-lg font-semibold text-white">Create Workspace</h3>
		<form
			class="space-y-3"
			onsubmit={(e) => {
				e.preventDefault();
				createWorkspace();
			}}
		>
			<Input label="Workspace Name" placeholder="My Workspace" bind:value={newWsName} />
			<div>
				<label for="ws-desc" class="mb-1 block text-sm text-slate-400">Description (optional)</label
				>
				<textarea
					id="ws-desc"
					bind:value={newWsDescription}
					rows={3}
					placeholder="What is this workspace for?"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
				></textarea>
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="ghost" size="sm" onclick={() => (showNewWorkspaceModal = false)}
					>Cancel</Button
				>
				<Button
					variant="primary"
					size="sm"
					type="submit"
					disabled={creatingWs || !newWsName.trim()}
				>
					{creatingWs ? 'Creating...' : 'Create'}
				</Button>
			</div>
		</form>
	</div>
</Modal>
