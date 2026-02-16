<script lang="ts">
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import NodeRenderer from '$lib/components/nodes/NodeRenderer.svelte';
	import EdgeRenderer from '$lib/components/edges/EdgeRenderer.svelte';
	import FloatingToolbar from '$lib/components/editor/FloatingToolbar.svelte';
	import Toolbar from '$lib/components/editor/Toolbar.svelte';
	import EditorSidebar from '$lib/components/editor/Sidebar.svelte';
	import PropertyPanel from '$lib/components/editor/PropertyPanel.svelte';
	import DslEditor from '$lib/components/editor/DslEditor.svelte';
	import Minimap from '$lib/components/canvas/Minimap.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { documentStore } from '$lib/stores/document';
	import { historyStore } from '$lib/stores/history';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';

	let { data } = $props();

	let diagramTitle = $state('Untitled Diagram');
	let diagramType = $state('flowchart');
	let showDslEditor = $state(false);
	let isLeftSidebarOpen = $state(true);
	let isRightSidebarOpen = $state(true);
	let svgRef: SVGSVGElement | null = null;

	function handleTitleChange(newTitle: string) {
		diagramTitle = newTitle;
	}

	function handleKeyDown(e: KeyboardEvent) {
		const isCtrl = e.ctrlKey || e.metaKey;
		const key = e.key.toLowerCase();

		if (isCtrl) {
			switch (key) {
				case 'z':
					e.preventDefault();
					if (e.shiftKey) {
						const state = historyStore.redo(get(documentStore));
						if (state) documentStore.set(state);
					} else {
						const state = historyStore.undo(get(documentStore));
						if (state) documentStore.set(state);
					}
					break;
				case 'y':
					e.preventDefault();
					const state = historyStore.redo(get(documentStore));
					if (state) documentStore.set(state);
					break;
				case 's':
					e.preventDefault();
					// Trigger save via toast
					if (typeof window !== 'undefined' && (window as any).__gradiol_toast) {
						(window as any).__gradiol_toast('Document saved', 'success');
					}
					break;
			}
		}

		// Toggle DSL editor with Ctrl+D
		if (isCtrl && key === 'd') {
			e.preventDefault();
			showDslEditor = !showDslEditor;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-200">
	<!-- Top Toolbar -->
	<Toolbar title={diagramTitle} {diagramType} onTitleChange={handleTitleChange} svgRef={null} />

	<div class="relative flex flex-1 overflow-hidden">
		<!-- Left Sidebar (Shape Palette) -->
		{#if isLeftSidebarOpen}
			<EditorSidebar {diagramType} />
		{/if}

		<!-- Main Canvas Area -->
		<main class="relative flex flex-1 flex-col bg-slate-950">
			<div class="relative flex-1">
				<Canvas>
					<EdgeRenderer />
					<NodeRenderer />
				</Canvas>

				<FloatingToolbar />
				<Minimap />

				<!-- DSL Toggle Button -->
				{#if !showDslEditor}
					<div class="absolute right-0 bottom-0 left-0 z-20">
						<button
							class="flex w-full items-center justify-between border-t border-slate-800 bg-slate-900/90 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-slate-800/90"
							onclick={() => (showDslEditor = true)}
							aria-label="Open DSL Editor"
						>
							<div class="flex items-center gap-2">
								<svg
									class="h-4 w-4 text-cyan-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
									/>
								</svg>
								<span class="text-xs font-medium text-slate-400">Text-to-Diagram (DSL)</span>
							</div>
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
									d="M5 15l7-7 7 7"
								/>
							</svg>
						</button>
					</div>
				{/if}
			</div>

			<!-- DSL Editor Panel -->
			<DslEditor
				{diagramType}
				title={diagramTitle}
				visible={showDslEditor}
				onToggle={() => (showDslEditor = !showDslEditor)}
			/>
		</main>

		<!-- Right Sidebar (Properties) -->
		{#if isRightSidebarOpen}
			<PropertyPanel />
		{/if}
	</div>
</div>

<!-- Toast Notifications -->
<Toast />
