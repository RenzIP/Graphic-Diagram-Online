<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';

	let activeTab = $state('style'); // style, text, arrange

	let selectedNodeId = $derived($selectionStore.nodes[0]);
	let selectedEdgeId = $derived($selectionStore.edges[0]);

	let selectedNode = $derived(
		selectedNodeId ? $documentStore.nodes.find((n) => n.id === selectedNodeId) : null
	);
	let selectedEdge = $derived(
		selectedEdgeId ? $documentStore.edges.find((e) => e.id === selectedEdgeId) : null
	);

	function updateNode(prop: string, value: any) {
		if (selectedNodeId) {
			documentStore.updateNode(selectedNodeId, { [prop]: value });
		}
	}

	function updateNodeStyle(prop: string, value: any) {
		if (selectedNodeId && selectedNode) {
			const currentStyle = selectedNode.style || {};
			documentStore.updateNode(selectedNodeId, {
				style: { ...currentStyle, [prop]: value }
			});
		}
	}

	function updateEdge(prop: string, value: any) {
		if (selectedEdgeId) {
			documentStore.updateEdge(selectedEdgeId, { [prop]: value });
		}
	}

	function updateEdgeStyle(prop: string, value: any) {
		if (selectedEdgeId && selectedEdge) {
			const currentStyle = selectedEdge.style || {};
			documentStore.updateEdge(selectedEdgeId, {
				style: { ...currentStyle, [prop]: value }
			});
		}
	}

	function moveOrder(direction: 'front' | 'back') {
		if (selectedNodeId) {
			documentStore.moveNodeOrder(selectedNodeId, direction);
		}
	}
</script>

<div class="flex h-full w-64 flex-col border-l border-white/5 bg-background/90 backdrop-blur-xl shadow-xl">
	<!-- Header -->
	<div class="border-b border-white/5 bg-surface/50 px-4 py-3">
		<h2 class="text-xs font-bold tracking-wider text-text-tertiary uppercase font-outfit">Properties</h2>
	</div>

	{#if selectedNode}
		<!-- Tabs -->
		<div class="flex border-b border-white/5">
			{#each ['style', 'text', 'arrange'] as tab}
				<button
					class="flex-1 py-2 text-xs font-medium capitalize transition-colors {activeTab === tab
						? 'border-b-2 border-primary bg-primary/10 text-primary'
						: 'text-text-secondary hover:bg-surface/50 hover:text-white'}"
					onclick={() => (activeTab = tab)}
				>
					{tab}
				</button>
			{/each}
		</div>

		<div class="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
			<!-- STYLE TAB -->
			{#if activeTab === 'style'}
				<div class="space-y-4">
					<!-- Fill -->
					<div class="space-y-2">
						<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Fill</p>
						<div class="flex items-center gap-2">
							<input
								type="color"
								value={selectedNode.style?.fill || '#ffffff'}
								oninput={(e) => updateNodeStyle('fill', e.currentTarget.value)}
								class="h-8 w-8 cursor-pointer rounded border border-white/10 bg-surface p-0.5"
							/>
							<span class="text-xs text-text-secondary uppercase font-mono"
								>{selectedNode.style?.fill || '#ffffff'}</span
							>
						</div>
						<!-- Gradient Toggle -->
						<label class="flex items-center gap-2 text-xs text-text-secondary">
							<input
								type="checkbox"
								checked={!!selectedNode.style?.gradient}
								onchange={(e) => updateNodeStyle('gradient', e.currentTarget.checked)}
								class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"
							/>
							Gradient
						</label>
					</div>

					<hr class="border-white/5" />

					<!-- Stroke -->
					<div class="space-y-2">
						<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Border</p>
						<div class="grid grid-cols-2 gap-2">
							<input
								type="color"
								value={selectedNode.style?.stroke || '#000000'}
								oninput={(e) => updateNodeStyle('stroke', e.currentTarget.value)}
								class="h-8 w-full cursor-pointer rounded border border-white/10 bg-surface p-0.5"
							/>
							<input
								type="number"
								min="0"
								max="20"
								value={selectedNode.style?.strokeWidth ?? 2}
								oninput={(e) => updateNodeStyle('strokeWidth', +e.currentTarget.value)}
								class="h-8 w-full rounded border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder-text-tertiary px-2"
								placeholder="Width"
							/>
						</div>
						<select
							value={selectedNode.style?.strokeDasharray || 'none'}
							onchange={(e) => updateNodeStyle('strokeDasharray', e.currentTarget.value)}
							class="w-full rounded border-white/10 bg-surface/50 py-1.5 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2"
						>
							<option value="none" class="bg-surface">Solid</option>
							<option value="5,5" class="bg-surface">Dashed</option>
							<option value="2,2" class="bg-surface">Dotted</option>
						</select>
						
						<div class="mt-2 flex items-center gap-2">
							<span class="w-12 text-[10px] uppercase font-bold text-text-tertiary">Radius</span>
							<input
								type="number"
								min="0"
								max="50"
								value={selectedNode.style?.borderRadius ?? 4}
								oninput={(e) => updateNodeStyle('borderRadius', +e.currentTarget.value)}
								class="flex-1 rounded-lg border border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2 h-8"
							/>
						</div>
					</div>

					<hr class="border-white/5" />

					<!-- Effects -->
					<div class="space-y-2">
						<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Effects</p>
						<label class="flex items-center gap-2 text-xs text-text-secondary">
							<input
								type="checkbox"
								checked={!!selectedNode.style?.shadow}
								onchange={(e) => updateNodeStyle('shadow', e.currentTarget.checked)}
								class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"
							/>
							Drop Shadow
						</label>
						<div class="flex items-center gap-2">
							<span class="w-12 text-xs text-text-secondary">Opacity</span>
							<input
								type="range"
								min="0"
								max="1"
								step="0.1"
								value={selectedNode.style?.opacity ?? 1}
								oninput={(e) => updateNodeStyle('opacity', +e.currentTarget.value)}
								class="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-surface accent-primary"
							/>
							<span class="w-8 text-right text-xs text-text-secondary font-mono"
								>{Math.round((selectedNode.style?.opacity ?? 1) * 100)}%</span
							>
						</div>
					</div>
				</div>

				<!-- TEXT TAB -->
			{:else if activeTab === 'text'}
				<div class="space-y-4">
					<div class="space-y-2">
						<label for="node-label" class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Label</label>
						<textarea
							id="node-label"
							value={selectedNode.label}
							oninput={(e) => updateNode('label', e.currentTarget.value)}
							class="w-full rounded-xl border border-white/10 bg-surface/50 p-2 text-sm text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none min-h-[80px]"
							rows="2"
						></textarea>
					</div>

					<div class="space-y-2">
						<label for="node-font-family" class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Font</label>
						<select
							id="node-font-family"
							value={selectedNode.style?.fontFamily || 'sans-serif'}
							onchange={(e) => updateNodeStyle('fontFamily', e.currentTarget.value)}
							class="w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2"
						>
							<option value="sans-serif" class="bg-surface">Sans Serif</option>
							<option value="serif" class="bg-surface">Serif</option>
							<option value="monospace" class="bg-surface">Monospace</option>
						</select>

						<div class="flex items-center gap-2">
							<input
								type="number"
								value={selectedNode.style?.fontSize || 14}
								oninput={(e) => updateNodeStyle('fontSize', +e.currentTarget.value)}
								class="mr-auto w-20 rounded-lg border border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2 h-8"
							/>
							<div class="flex overflow-hidden rounded-lg border border-white/10 bg-surface/50">
								<button
									class="px-2 py-1 transition-colors hover:bg-white/5 {selectedNode.style?.fontWeight === 'bold'
										? 'bg-primary/20 text-primary'
										: 'text-text-secondary'}"
									onclick={() =>
										updateNodeStyle(
											'fontWeight',
											selectedNode.style?.fontWeight === 'bold' ? 'normal' : 'bold'
										)}
									title="Bold"
								>
									<strong>B</strong>
								</button>
								<button
									class="px-2 py-1 transition-colors hover:bg-white/5 border-l border-r border-white/5 {selectedNode.style?.fontStyle === 'italic'
										? 'bg-primary/20 text-primary'
										: 'text-text-secondary'}"
									onclick={() =>
										updateNodeStyle(
											'fontStyle',
											selectedNode.style?.fontStyle === 'italic' ? 'normal' : 'italic'
										)}
									title="Italic"
								>
									<em>I</em>
								</button>
								<button
									class="px-2 py-1 transition-colors hover:bg-white/5 {selectedNode.style?.textDecoration ===
									'underline'
										? 'bg-primary/20 text-primary'
										: 'text-text-secondary'}"
									onclick={() =>
										updateNodeStyle(
											'textDecoration',
											selectedNode.style?.textDecoration === 'underline' ? 'none' : 'underline'
										)}
									title="Underline"
								>
									<span class="underline">U</span>
								</button>
							</div>
						</div>
					</div>
					<div class="space-y-2">
						<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Color</p>
						<div class="flex items-center gap-2">
							<input
								type="color"
								value={selectedNode.style?.color ||
									(selectedNode.color === 'white' ? '#000000' : '#ffffff')}
								oninput={(e) => updateNodeStyle('color', e.currentTarget.value)}
								class="h-8 w-8 cursor-pointer rounded border border-white/10 bg-surface p-0.5"
							/>
							<span class="text-xs text-text-secondary uppercase font-mono"
								>{selectedNode.style?.color || 'Auto'}</span
							>
						</div>
					</div>
				</div>

				<!-- ARRANGE TAB -->
			{:else if activeTab === 'arrange'}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<label for="node-position-x" class="text-[10px] font-bold text-text-tertiary uppercase">X</label>
							<input
								id="node-position-x"
								type="number"
								value={Math.round(selectedNode.position.x)}
								onchange={(e) =>
									documentStore.updateNode(selectedNodeId, {
										position: { x: +e.currentTarget.value, y: selectedNode.position.y }
									})}
								class="w-full rounded-lg border border-white/10 bg-surface/50 p-1.5 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
							/>
						</div>
						<div class="space-y-1">
							<label for="node-position-y" class="text-[10px] font-bold text-text-tertiary uppercase">Y</label>
							<input
								id="node-position-y"
								type="number"
								value={Math.round(selectedNode.position.y)}
								onchange={(e) =>
									documentStore.updateNode(selectedNodeId, {
										position: { x: selectedNode.position.x, y: +e.currentTarget.value }
									})}
								class="w-full rounded-lg border border-white/10 bg-surface/50 p-1.5 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
							/>
						</div>
						<div class="space-y-1">
							<label for="node-width" class="text-[10px] font-bold text-text-tertiary uppercase">W</label>
							<input
								id="node-width"
								type="number"
								value={selectedNode.width || 120}
								onchange={(e) => updateNode('width', +e.currentTarget.value)}
								class="w-full rounded-lg border border-white/10 bg-surface/50 p-1.5 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
							/>
						</div>
						<div class="space-y-1">
							<label for="node-height" class="text-[10px] font-bold text-text-tertiary uppercase">H</label>
							<input
								id="node-height"
								type="number"
								value={selectedNode.height || 60}
								onchange={(e) => updateNode('height', +e.currentTarget.value)}
								class="w-full rounded-lg border border-white/10 bg-surface/50 p-1.5 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
							/>
						</div>
					</div>

					<hr class="border-white/5" />

					<div class="space-y-2">
						<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Z-Order</p>
						<div class="grid grid-cols-2 gap-2">
							<button
								class="rounded-lg border border-white/10 bg-surface/30 py-1.5 text-xs text-text-secondary hover:bg-surface hover:text-white transition-colors"
								onclick={() => moveOrder('front')}
							>
								Bring to Front
							</button>
							<button
								class="rounded-lg border border-white/10 bg-surface/30 py-1.5 text-xs text-text-secondary hover:bg-surface hover:text-white transition-colors"
								onclick={() => moveOrder('back')}
							>
								Send to Back
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<label class="flex items-center gap-2 text-xs text-text-secondary">
							<input
								type="checkbox"
								checked={!!selectedNode.locked}
								onchange={(e) => updateNode('locked', e.currentTarget.checked)}
								class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"
							/>
							Lock Position
						</label>
					</div>
				</div>
			{/if}
		</div>
	{:else if selectedEdge}
		<!-- EDGE PROPERTIES -->
		<div class="space-y-4 p-4 text-text-primary custom-scrollbar overflow-y-auto">
			<div class="space-y-2">
				<label for="edge-line-style" class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Line Style</label>
				<select
					id="edge-line-style"
					value={selectedEdge.type || 'default'}
					onchange={(e) => updateEdge('type', e.currentTarget.value)}
					class="w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
				>
					<option value="default" class="bg-surface">Bezier (Smooth)</option>
					<option value="orthogonal" class="bg-surface">Orthogonal (Step)</option>
					<option value="curved" class="bg-surface">Curved Orthogonal</option>
					<option value="straight" class="bg-surface">Straight</option>
				</select>
			</div>
			<div class="space-y-2">
				<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Stroke</p>
				<div class="flex gap-2">
					<input
						type="color"
						value={selectedEdge.style?.stroke || '#6366F1'}
						oninput={(e) => updateEdgeStyle('stroke', e.currentTarget.value)}
						class="h-8 w-8 cursor-pointer rounded border border-white/10 bg-surface p-0.5"
					/>
					<input
						type="number"
						min="1"
						max="10"
						value={selectedEdge.style?.strokeWidth ?? 2}
						oninput={(e) => updateEdgeStyle('strokeWidth', +e.currentTarget.value)}
						class="h-8 flex-1 rounded-lg border border-white/10 bg-surface/50 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 px-2"
					/>
				</div>
				<select
					value={selectedEdge.style?.strokeDasharray || 'none'}
					onchange={(e) => updateEdgeStyle('strokeDasharray', e.currentTarget.value)}
					class="mt-2 w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
				>
					<option value="none" class="bg-surface">Solid</option>
					<option value="5,5" class="bg-surface">Dashed</option>
					<option value="2,2" class="bg-surface">Dotted</option>
				</select>
			</div>
			<div class="space-y-2">
				<p class="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Markers</p>
				<div class="grid grid-cols-2 gap-2">
					<select
						value={selectedEdge.markerStart || 'none'}
						onchange={(e) => updateEdge('markerStart', e.currentTarget.value)}
						class="w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
					>
						<option value="none" class="bg-surface">None</option>
						<option value="arrow" class="bg-surface">Arrow</option>
						<option value="circle" class="bg-surface">Circle</option>
					</select>
					<select
						value={selectedEdge.markerEnd || 'arrow'}
						onchange={(e) => updateEdge('markerEnd', e.currentTarget.value)}
						class="w-full rounded-lg border border-white/10 bg-surface/50 py-1.5 px-2 text-xs text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
					>
						<option value="none" class="bg-surface">None</option>
						<option value="arrow" class="bg-surface">Arrow</option>
						<option value="circle" class="bg-surface">Circle</option>
					</select>
				</div>
			</div>
			<div class="space-y-2">
				<label class="flex items-center gap-2 text-xs text-text-secondary">
					<input
						type="checkbox"
						checked={!!selectedEdge.animated}
						onchange={(e) => updateEdge('animated', e.currentTarget.checked)}
						class="rounded border-white/10 bg-surface text-primary focus:ring-primary/50"
					/>
					Animated
				</label>
			</div>
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center p-8 text-center text-text-tertiary">
			<div class="space-y-3">
				<div class="mx-auto w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center mb-2 border border-white/5">
					<svg class="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
					</svg>
				</div>
				<p class="text-[13px]">Select a shape or connection to edit its properties</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
