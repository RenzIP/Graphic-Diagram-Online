<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';
	import { NODE_COLORS, EDGE_TYPES } from '$lib/utils/constants';

	// Get the first selected node (if any)
	let selectedNode = $derived.by(() => {
		const ids = $selectionStore.nodes;
		if (ids.length === 0) return null;
		return $documentStore.nodes.find((n) => n.id === ids[0]) || null;
	});

	let selectedEdge = $derived.by(() => {
		const ids = $selectionStore.edges;
		if (ids.length === 0) return null;
		return $documentStore.edges.find((e) => e.id === ids[0]) || null;
	});

	function updateNodeColor(color: string) {
		if (!selectedNode) return;
		documentStore.updateNode(selectedNode.id, { color });
	}

	function updateNodeLabel(e: Event) {
		if (!selectedNode) return;
		documentStore.updateNode(selectedNode.id, { label: (e.target as HTMLInputElement).value });
	}

	function updateNodeWidth(e: Event) {
		if (!selectedNode) return;
		documentStore.updateNode(selectedNode.id, {
			width: parseInt((e.target as HTMLInputElement).value) || 120
		});
	}

	function updateNodeHeight(e: Event) {
		if (!selectedNode) return;
		documentStore.updateNode(selectedNode.id, {
			height: parseInt((e.target as HTMLInputElement).value) || 60
		});
	}

	function updateEdgeLabel(e: Event) {
		if (!selectedEdge) return;
		documentStore.updateEdge(selectedEdge.id, { label: (e.target as HTMLInputElement).value });
	}

	function updateEdgeType(type: string) {
		if (!selectedEdge) return;
		documentStore.updateEdge(selectedEdge.id, { type: type as any });
	}
</script>

<aside class="flex w-64 flex-col border-l border-slate-800 bg-slate-900">
	<div class="border-b border-slate-800 px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Properties</h3>
	</div>

	<div class="flex-1 overflow-y-auto p-4">
		{#if selectedNode}
			<!-- Node Properties -->
			<div class="space-y-4">
				<div>
					<label class="mb-1 block text-xs font-medium text-slate-400">Label</label>
					<input
						type="text"
						value={selectedNode.label}
						oninput={updateNodeLabel}
						class="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
					/>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-slate-400">Type</label>
					<div
						class="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 capitalize"
					>
						{selectedNode.type}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label class="mb-1 block text-xs font-medium text-slate-400">Width</label>
						<input
							type="number"
							value={selectedNode.width || 120}
							oninput={updateNodeWidth}
							class="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-xs font-medium text-slate-400">Height</label>
						<input
							type="number"
							value={selectedNode.height || 60}
							oninput={updateNodeHeight}
							class="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-slate-400">Position</label>
					<div class="grid grid-cols-2 gap-2 text-xs text-slate-400">
						<div class="rounded border border-slate-700 bg-slate-800 px-3 py-1.5">
							X: {Math.round(selectedNode.position.x)}
						</div>
						<div class="rounded border border-slate-700 bg-slate-800 px-3 py-1.5">
							Y: {Math.round(selectedNode.position.y)}
						</div>
					</div>
				</div>

				<div>
					<label class="mb-2 block text-xs font-medium text-slate-400">Color</label>
					<div class="flex flex-wrap gap-2">
						{#each NODE_COLORS as color}
							<button
								class="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 {selectedNode.color ===
								color.value
									? 'scale-110 border-white'
									: 'border-transparent'}"
								style="background-color: var(--color-{color.value}-500, #6366f1)"
								onclick={() => updateNodeColor(color.value)}
								title={color.name}
								aria-label={color.name}
							></button>
						{/each}
					</div>
				</div>
			</div>
		{:else if selectedEdge}
			<!-- Edge Properties -->
			<div class="space-y-4">
				<div>
					<label class="mb-1 block text-xs font-medium text-slate-400">Label</label>
					<input
						type="text"
						value={selectedEdge.label || ''}
						oninput={updateEdgeLabel}
						placeholder="Edge label..."
						class="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
					/>
				</div>

				<div>
					<label class="mb-2 block text-xs font-medium text-slate-400">Type</label>
					<div class="space-y-1">
						{#each EDGE_TYPES as type}
							<button
								class="w-full rounded border px-3 py-1.5 text-left text-sm transition-colors {selectedEdge.type ===
								type.id
									? 'border-indigo-500 bg-indigo-500/10 text-white'
									: 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'}"
								onclick={() => updateEdgeType(type.id)}
							>
								{type.name}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<svg
					class="mb-3 h-10 w-10 text-slate-700"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
					/>
				</svg>
				<p class="text-sm text-slate-500">Select a node or edge<br />to view properties</p>
			</div>
		{/if}
	</div>
</aside>
