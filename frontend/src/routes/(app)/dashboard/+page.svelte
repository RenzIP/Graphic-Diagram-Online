<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { DIAGRAM_TYPES } from '$lib/utils/constants';

	let searchQuery = $state('');
	let showNewDiagramModal = $state(false);

	const recentDocs = [
		{
			id: '1',
			title: 'User Login Flow',
			type: 'Flowchart',
			updated: '2 mins ago',
			preview: 'indigo'
		},
		{ id: '2', title: 'Database Schema', type: 'ERD', updated: '2 hours ago', preview: 'purple' },
		{
			id: '3',
			title: 'System Architecture',
			type: 'Use Case',
			updated: '1 day ago',
			preview: 'cyan'
		},
		{
			id: '4',
			title: 'Checkout Process',
			type: 'Sequence',
			updated: '3 days ago',
			preview: 'emerald'
		}
	];

	let filteredDocs = $derived(
		searchQuery
			? recentDocs.filter(
					(d) =>
						d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						d.type.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: recentDocs
	);

	function createDiagram(typeId: string) {
		showNewDiagramModal = false;
		window.location.href = `/editor/${crypto.randomUUID()}?type=${typeId}`;
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
						onclick={() => (window.location.href = `/editor/${crypto.randomUUID()}`)}
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
					<Button variant="ghost" size="sm">View All</Button>
				</div>

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
									class={`absolute inset-0 bg-${doc.preview}-500/5 group-hover:bg-${doc.preview}-500/10 transition-colors`}
								></div>
								<div
									class="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<button class="rounded border border-slate-700 bg-slate-800 p-1 hover:text-white">
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
											/>
										</svg>
									</button>
								</div>
							</div>
							<div class="p-4">
								<div class="flex items-start justify-between">
									<div>
										<h3
											class="truncate font-medium text-slate-200 transition-colors group-hover:text-indigo-400"
										>
											{doc.title}
										</h3>
										<p class="mt-1 text-xs text-slate-500">Edited {doc.updated}</p>
									</div>
									<span
										class="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-400 uppercase"
									>
										{doc.type}
									</span>
								</div>
							</div>
						</Card>
					{/each}
				</div>
			</section>
		</div>
	</main>
</div>
