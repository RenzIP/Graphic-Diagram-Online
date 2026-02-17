<script lang="ts">
	import { selectionStore } from '$lib/stores/selection';
	import { documentStore } from '$lib/stores/document';

	let selection = $derived($selectionStore);

	// Derived state for the single selected node
	let selectedNodeId = $derived(selection.nodes.length === 1 ? selection.nodes[0] : null);
	let node = $derived(
		selectedNodeId ? $documentStore.nodes.find((n) => n.id === selectedNodeId) || null : null
	);

	// Derived state for selected edge
	let selectedEdgeId = $derived(selection.edges.length === 1 ? selection.edges[0] : null);
	let edge = $derived(
		selectedEdgeId ? $documentStore.edges.find((e) => e.id === selectedEdgeId) || null : null
	);

	let activeTab = $state('style'); // style, text, arrange

	function updateNode(prop: string, value: any) {
		if (selectedNodeId) {
			documentStore.updateNode(selectedNodeId, { [prop]: value });
		}
	}

	function updateEdge(prop: string, value: any) {
		if (selectedEdgeId) {
			documentStore.updateEdge(selectedEdgeId, { [prop]: value });
		}
	}

	const COLORS = [
		{ name: 'White', value: '#ffffff', border: '#cbd5e1' },
		{ name: 'Blue', value: '#dbeafe', border: '#3b82f6' },
		{ name: 'Green', value: '#dcfce7', border: '#22c55e' },
		{ name: 'Red', value: '#fee2e2', border: '#ef4444' },
		{ name: 'Yellow', value: '#fef9c3', border: '#eab308' },
		{ name: 'Purple', value: '#f3e8ff', border: '#a855f7' },
		{ name: 'Orange', value: '#ffedd5', border: '#f97316' },
		{ name: 'Gray', value: '#f1f5f9', border: '#64748b' }
	];
</script>

<aside
	class="flex w-64 flex-col border-l border-[#303030] bg-[#1e1e1e] text-xs text-gray-300 select-none"
>
	{#if node || edge}
		<!-- Tabs -->
		<div class="flex border-b border-[#303030]">
			<button
				class="flex-1 py-2 font-medium transition-colors hover:bg-[#2a2a2a] {activeTab === 'style'
					? 'border-b-2 border-indigo-500 bg-[#2a2a2a] text-white'
					: 'text-gray-500'}"
				onclick={() => (activeTab = 'style')}
			>
				Style
			</button>
			<button
				class="flex-1 py-2 font-medium transition-colors hover:bg-[#2a2a2a] {activeTab === 'text'
					? 'border-b-2 border-indigo-500 bg-[#2a2a2a] text-white'
					: 'text-gray-500'}"
				onclick={() => (activeTab = 'text')}
			>
				Text
			</button>
			<button
				class="flex-1 py-2 font-medium transition-colors hover:bg-[#2a2a2a] {activeTab === 'arrange'
					? 'border-b-2 border-indigo-500 bg-[#2a2a2a] text-white'
					: 'text-gray-500'}"
				onclick={() => (activeTab = 'arrange')}
			>
				Arrange
			</button>
		</div>

		<div class="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
			{#if activeTab === 'style'}
				{#if node}
					<!-- Color Palette -->
					<div class="space-y-2">
						<label class="text-[10px] font-semibold tracking-wider text-gray-500 uppercase"
							>Fill Color</label
						>
						<div class="grid grid-cols-4 gap-2">
							{#each COLORS as color}
								<button
									class="h-6 w-full rounded border transition-transform hover:scale-105"
									style="background-color: {color.value}; border-color: {color.border}"
									onclick={() => updateNode('color', color.value)}
									title={color.name}
								></button>
							{/each}
						</div>
					</div>
				{/if}
				{#if edge}
					<div class="space-y-2">
						<label class="text-[10px] font-semibold tracking-wider text-gray-500 uppercase"
							>Line Type</label
						>
						<select
							class="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1.5 outline-none focus:border-indigo-500"
							value={edge.type || 'straight'}
							onchange={(e) => updateEdge('type', e.currentTarget.value)}
						>
							<option value="straight">Straight</option>
							<option value="step">Step</option>
							<option value="bezier">Bezier</option>
						</select>
					</div>
				{/if}
			{:else if activeTab === 'text'}
				<div class="space-y-3">
					<div class="space-y-1">
						<label class="text-[10px] font-semibold tracking-wider text-gray-500 uppercase"
							>Label Content</label
						>
						<textarea
							class="min-h-[60px] w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1.5 outline-none focus:border-indigo-500"
							value={node?.label || edge?.label || ''}
							oninput={(e) =>
								node
									? updateNode('label', e.currentTarget.value)
									: updateEdge('label', e.currentTarget.value)}
						></textarea>
					</div>
					<!-- Mock Font Options -->
					<div class="pointer-events-none space-y-1 opacity-50" title="Coming soon">
						<label class="text-[10px] font-semibold tracking-wider text-gray-500 uppercase"
							>Font</label
						>
						<select class="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1.5">
							<option>Helvetica</option>
						</select>
					</div>
				</div>
			{:else if activeTab === 'arrange'}
				{#if node}
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1">
							<label class="text-gray-500">Position X</label>
							<input
								type="number"
								class="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1"
								value={Math.round(node.position.x)}
								oninput={(e) =>
									updateNode('position', { ...node?.position, x: +e.currentTarget.value })}
							/>
						</div>
						<div class="space-y-1">
							<label class="text-gray-500">Position Y</label>
							<input
								type="number"
								class="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1"
								value={Math.round(node.position.y)}
								oninput={(e) =>
									updateNode('position', { ...node?.position, y: +e.currentTarget.value })}
							/>
						</div>
						<div class="space-y-1">
							<label class="text-gray-500">Width</label>
							<input
								type="number"
								class="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1"
								value={node.width || 120}
								oninput={(e) => updateNode('width', +e.currentTarget.value)}
							/>
						</div>
						<div class="space-y-1">
							<label class="text-gray-500">Height</label>
							<input
								type="number"
								class="w-full rounded border border-[#3e3e3e] bg-[#2a2a2a] px-2 py-1"
								value={node.height || 60}
								oninput={(e) => updateNode('height', +e.currentTarget.value)}
							/>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{:else}
		<div class="flex h-full flex-col items-center justify-center p-4 text-center text-gray-500">
			<svg class="mb-3 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
			<p>Select an element to edit styles</p>
			<!-- Diagram Global Settings -->
			<div class="mt-8 w-full border-t border-[#303030] pt-4 text-left">
				<h4 class="mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
					Diagram
				</h4>
				<div class="space-y-2">
					<label class="flex items-center gap-2">
						<input type="checkbox" checked class="rounded border-slate-700 bg-[#2a2a2a]" />
						<span>Grid</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" checked class="rounded border-slate-700 bg-[#2a2a2a]" />
						<span>Page View</span>
					</label>
				</div>
			</div>
		</div>
	{/if}
</aside>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: #1e1e1e;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #303030;
		border-radius: 2px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #4a4a4a;
	}
</style>
