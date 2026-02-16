<script lang="ts">
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import NodeRenderer from '$lib/components/nodes/NodeRenderer.svelte';
	import EdgeRenderer from '$lib/components/edges/EdgeRenderer.svelte';
	import FloatingToolbar from '$lib/components/editor/FloatingToolbar.svelte';
	import { documentStore } from '$lib/stores/document';

	// Placeholder for sidebars
	import Button from '$lib/components/ui/Button.svelte';
	import { page } from '$app/stores';

	let { data } = $props();
	// In a real app, we would load the document based on $page.params.id

	let isLeftSidebarOpen = $state(true);
	let isRightSidebarOpen = $state(true);

	function toggleLeft() {
		isLeftSidebarOpen = !isLeftSidebarOpen;
	}
	function toggleRight() {
		isRightSidebarOpen = !isRightSidebarOpen;
	}
	function handleKeyDown(e: KeyboardEvent) {
		const isCtrl = e.ctrlKey || e.metaKey;
		const key = e.key.toLowerCase();

		if (isCtrl) {
			switch (key) {
				case 'z':
					e.preventDefault();
					if (e.shiftKey) {
						documentStore.redo();
					} else {
						documentStore.undo();
					}
					break;
				case 'y':
					e.preventDefault();
					documentStore.redo();
					break;
				case 's':
					e.preventDefault();
					// Save logic would go here
					alert('Save shortcut triggered (Logic pending backend)');
					break;
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-200">
	<!-- Top Toolbar -->
	<header
		class="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4"
	>
		<div class="flex items-center gap-4">
			<!-- Mobile Menu Button -->
			<button class="text-slate-400 hover:text-white md:hidden" onclick={toggleLeft}>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			<div
				class="hidden bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent sm:block"
			>
				GraDiOl
			</div>
			<div class="hidden h-6 w-px bg-slate-700 sm:block"></div>
			<div class="max-w-[150px] truncate text-sm text-slate-400 sm:max-w-xs">Untitled Diagram</div>
		</div>

		<div class="flex items-center gap-2">
			<div class="hidden gap-2 sm:flex">
				<Button size="sm" variant="ghost" onclick={() => documentStore.undo()}>Undo</Button>
				<Button size="sm" variant="ghost" onclick={() => documentStore.redo()}>Redo</Button>
				<div class="mx-2 h-6 w-px bg-slate-700"></div>
			</div>
			<Button size="sm" variant="primary">Share</Button>

			<!-- Mobile Properties Toggle -->
			<button class="ml-2 text-slate-400 hover:text-white md:hidden" onclick={toggleRight}>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
					/>
				</svg>
			</button>
		</div>
	</header>

	<div class="relative flex flex-1 overflow-hidden">
		<!-- Left Sidebar (Shape Palette) -->
		<aside
			class="{isLeftSidebarOpen
				? 'translate-x-0'
				: '-translate-x-full'} absolute z-10 flex h-full w-16 flex-col items-center gap-4 border-r border-slate-800 bg-slate-900 py-4 transition-transform duration-200 ease-in-out md:relative md:translate-x-0"
		>
			<div
				class="flex h-10 w-10 cursor-move items-center justify-center rounded border border-slate-700 bg-slate-800 transition-colors hover:border-indigo-500"
				title="Process"
			>
				<div class="mb-2 h-8 w-12 rounded border-2 border-slate-500 bg-slate-800"></div>
				<span class="text-[10px] text-slate-400">Process</span>
			</div>
			<div
				class="flex cursor-grab flex-col items-center justify-center p-2 transition-transform hover:scale-105 active:cursor-grabbing"
				title="Decision"
			>
				<div class="mb-2 h-8 w-8 rotate-45 border-2 border-slate-500 bg-slate-800"></div>
				<span class="text-[10px] text-slate-400">Decision</span>
			</div>
			<div
				class="flex cursor-grab flex-col items-center justify-center p-2 transition-transform hover:scale-105 active:cursor-grabbing"
				title="Start/End"
			>
				<div class="mb-2 h-8 w-12 rounded-full border-2 border-slate-500 bg-slate-800"></div>
				<span class="text-[10px] text-slate-400">Start/End</span>
			</div>
		</aside>

		<!-- Main Canvas Area -->
		<main class="relative flex-1 bg-slate-950">
			<Canvas>
				<EdgeRenderer />
				<NodeRenderer />
			</Canvas>

			<FloatingToolbar />

			<!-- Minimap Placeholder -->
			<div
				class="absolute right-4 bottom-4 h-32 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/90 shadow-lg"
			>
				<div class="flex h-full w-full items-center justify-center text-xs text-slate-500">
					Minimap
				</div>
			</div>

			<!-- DSL Toggle / Panel -->
			<div class="absolute right-0 bottom-0 left-0 z-20 border-t border-slate-800 bg-slate-900">
				<div class="flex items-center justify-between px-4 py-2">
					<span class="text-xs font-medium text-slate-400">Text-to-Diagram (DSL)</span>
					<button class="text-slate-500 hover:text-white">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>
				<!-- Collapsed by default -->
			</div>
		</main>

		<!-- Right Sidebar (Properties) -->
		<aside
			class="{isRightSidebarOpen
				? 'translate-x-0'
				: 'translate-x-full'} absolute top-0 right-0 z-10 h-full w-64 border-l border-slate-800 bg-slate-900 p-4 transition-transform duration-200 ease-in-out md:relative md:translate-x-0"
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Properties</h3>
				<button class="text-slate-400 hover:text-white" onclick={toggleRight}>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
			<div class="mt-10 text-center text-sm text-slate-400">Select a node to edit properties</div>
		</aside>
	</div>
</div>
