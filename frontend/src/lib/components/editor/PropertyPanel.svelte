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

	// Helper for Z-Index (requires store support, implemented later)
	function moveOrder(direction: 'front' | 'back') {
		if (selectedNodeId) {
			documentStore.moveNodeOrder(selectedNodeId, direction);
		}
	}
</script>

<div class="flex h-full flex-col border-l border-slate-700/50 bg-slate-900 shadow-xl">
	<!-- Header -->
	<div class="border-b border-slate-700/50 bg-slate-800/50 px-4 py-3">
		<h2 class="text-xs font-bold tracking-wider text-slate-400 uppercase">Properties</h2>
	</div>

	{#if selectedNode}
		<!-- Tabs -->
		<div class="flex border-b border-slate-700/50">
			{#each ['style', 'text', 'arrange'] as tab}
				<button
					class="flex-1 py-2 text-xs font-medium capitalize transition-colors {activeTab === tab
						? 'border-b-2 border-indigo-500 bg-indigo-500/10 text-indigo-400'
						: 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}"
					onclick={() => (activeTab = tab)}
				>
					{tab}
				</button>
			{/each}
		</div>

		<div class="scrollbar-thin scrollbar-thumb-slate-700 flex-1 space-y-6 overflow-y-auto p-4">
			<!-- STYLE TAB -->
			{#if activeTab === 'style'}
				<div class="space-y-4">
					<!-- Fill -->
					<div class="space-y-2">
						<label class="block text-xs font-semibold text-slate-400">Fill</label>
						<div class="flex items-center gap-2">
							<input
								type="color"
								value={selectedNode.style?.fill || '#ffffff'}
								oninput={(e) => updateNodeStyle('fill', e.currentTarget.value)}
								class="h-8 w-8 cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5"
							/>
							<span class="text-xs text-slate-500 uppercase"
								>{selectedNode.style?.fill || '#ffffff'}</span
							>
						</div>
						<!-- Gradient Toggle -->
						<label class="flex items-center gap-2 text-xs text-slate-400">
							<input
								type="checkbox"
								checked={!!selectedNode.style?.gradient}
								onchange={(e) => updateNodeStyle('gradient', e.currentTarget.checked)}
								class="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
							/>
							Gradient
						</label>
					</div>

					<hr class="border-slate-700/50" />

					<!-- Stroke -->
					<div class="space-y-2">
						<label class="block text-xs font-semibold text-slate-400">Border</label>
						<div class="grid grid-cols-2 gap-2">
							<input
								type="color"
								value={selectedNode.style?.stroke || '#000000'}
								oninput={(e) => updateNodeStyle('stroke', e.currentTarget.value)}
								class="h-8 w-full cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5"
							/>
							<input
								type="number"
								min="0"
								max="20"
								value={selectedNode.style?.strokeWidth ?? 2}
								oninput={(e) => updateNodeStyle('strokeWidth', +e.currentTarget.value)}
								class="h-8 w-full rounded border-slate-600 bg-slate-800 text-xs text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
								placeholder="Width"
							/>
						</div>
						<select
							value={selectedNode.style?.strokeDasharray || 'none'}
							onchange={(e) => updateNodeStyle('strokeDasharray', e.currentTarget.value)}
							class="w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
						>
							<option value="none">Solid</option>
							<option value="5,5">Dashed</option>
							<option value="2,2">Dotted</option>
						</select>
					</div>

					<hr class="border-slate-700/50" />

					<!-- Effects -->
					<div class="space-y-2">
						<label class="block text-xs font-semibold text-slate-400">Effects</label>
						<label class="flex items-center gap-2 text-xs text-slate-400">
							<input
								type="checkbox"
								checked={!!selectedNode.style?.shadow}
								onchange={(e) => updateNodeStyle('shadow', e.currentTarget.checked)}
								class="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
							/>
							Drop Shadow
						</label>
						<div class="flex items-center gap-2">
							<span class="w-12 text-xs text-slate-500">Opacity</span>
							<input
								type="range"
								min="0"
								max="1"
								step="0.1"
								value={selectedNode.style?.opacity ?? 1}
								oninput={(e) => updateNodeStyle('opacity', +e.currentTarget.value)}
								class="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-indigo-500"
							/>
							<span class="w-6 text-right text-xs text-slate-500"
								>{Math.round((selectedNode.style?.opacity ?? 1) * 100)}%</span
							>
						</div>
					</div>
				</div>

				<!-- TEXT TAB -->
			{:else if activeTab === 'text'}
				<div class="space-y-4">
					<div class="space-y-2">
						<label class="block text-xs font-semibold text-slate-400">Label</label>
						<textarea
							value={selectedNode.label}
							oninput={(e) => updateNode('label', e.currentTarget.value)}
							class="w-full rounded border-slate-600 bg-slate-800 p-2 text-sm text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
							rows="2"
						></textarea>
					</div>

					<div class="space-y-2">
						<label class="block text-xs font-semibold text-slate-400">Font</label>
						<select
							value={selectedNode.style?.fontFamily || 'sans-serif'}
							onchange={(e) => updateNodeStyle('fontFamily', e.currentTarget.value)}
							class="w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
						>
							<option value="sans-serif">Sans Serif</option>
							<option value="serif">Serif</option>
							<option value="monospace">Monospace</option>
						</select>

						<div class="flex items-center gap-2">
							<input
								type="number"
								value={selectedNode.style?.fontSize || 14}
								oninput={(e) => updateNodeStyle('fontSize', +e.currentTarget.value)}
								class="mr-auto w-20 rounded border-slate-600 bg-slate-800 text-xs text-slate-200 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
							/>
							<div class="flex overflow-hidden rounded border border-slate-600">
								<button
									class="px-2 py-1 hover:bg-slate-700 {selectedNode.style?.fontWeight === 'bold'
										? 'bg-indigo-500/20 text-indigo-400'
										: 'text-slate-400'}"
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
									class="px-2 py-1 hover:bg-slate-700 {selectedNode.style?.fontStyle === 'italic'
										? 'bg-indigo-500/20 text-indigo-400'
										: 'text-slate-400'}"
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
									class="px-2 py-1 hover:bg-slate-700 {selectedNode.style?.textDecoration ===
									'underline'
										? 'bg-indigo-500/20 text-indigo-400'
										: 'text-slate-400'}"
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
						<label class="block text-xs font-semibold text-slate-400">Color</label>
						<div class="flex items-center gap-2">
							<input
								type="color"
								value={selectedNode.style?.color ||
									(selectedNode.color === 'white' ? '#000000' : '#ffffff')}
								oninput={(e) => updateNodeStyle('color', e.currentTarget.value)}
								class="h-8 w-8 cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5"
							/>
							<span class="text-xs text-slate-500 uppercase"
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
							<label class="text-[10px] font-bold text-slate-500 uppercase">X</label>
							<input
								type="number"
								value={Math.round(selectedNode.position.x)}
								onchange={(e) =>
									documentStore.updateNode(selectedNodeId, {
										position: { x: +e.currentTarget.value, y: selectedNode.position.y }
									})}
								class="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200"
							/>
						</div>
						<div class="space-y-1">
							<label class="text-[10px] font-bold text-slate-500 uppercase">Y</label>
							<input
								type="number"
								value={Math.round(selectedNode.position.y)}
								onchange={(e) =>
									documentStore.updateNode(selectedNodeId, {
										position: { x: selectedNode.position.x, y: +e.currentTarget.value }
									})}
								class="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200"
							/>
						</div>
						<div class="space-y-1">
							<label class="text-[10px] font-bold text-slate-500 uppercase">W</label>
							<input
								type="number"
								value={selectedNode.width || 120}
								onchange={(e) => updateNode('width', +e.currentTarget.value)}
								class="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200"
							/>
						</div>
						<div class="space-y-1">
							<label class="text-[10px] font-bold text-slate-500 uppercase">H</label>
							<input
								type="number"
								value={selectedNode.height || 60}
								onchange={(e) => updateNode('height', +e.currentTarget.value)}
								class="w-full rounded border-slate-600 bg-slate-800 p-1 text-xs text-slate-200"
							/>
						</div>
					</div>

					<hr class="border-slate-700/50" />

					<div class="space-y-2">
						<label class="block text-xs font-semibold text-slate-400">Z-Order</label>
						<div class="grid grid-cols-2 gap-2">
							<button
								class="rounded border border-slate-600 py-1 text-xs text-slate-300 hover:bg-slate-700"
								onclick={() => moveOrder('front')}
							>
								Bring to Front
							</button>
							<button
								class="rounded border border-slate-600 py-1 text-xs text-slate-300 hover:bg-slate-700"
								onclick={() => moveOrder('back')}
							>
								Send to Back
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<label class="flex items-center gap-2 text-xs text-slate-400">
							<input
								type="checkbox"
								checked={!!selectedNode.locked}
								onchange={(e) => updateNode('locked', e.currentTarget.checked)}
								class="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
							/>
							Lock Position
						</label>
					</div>
				</div>
			{/if}
		</div>
	{:else if selectedEdge}
		<!-- EDGE PROPERTIES (Simplified) -->
		<div class="space-y-4 p-4 text-slate-200">
			<div class="space-y-2">
				<label class="block text-xs font-semibold text-slate-400">Line Style</label>
				<select
					value={selectedEdge.type || 'default'}
					onchange={(e) => updateEdge('type', e.currentTarget.value)}
					class="w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200 shadow-sm focus:border-indigo-500"
				>
					<option value="default">Bezier (Smooth)</option>
					<option value="step">Step (Orthogonal)</option>
					<option value="straight">Straight</option>
				</select>
			</div>
			<div class="space-y-2">
				<label class="block text-xs font-semibold text-slate-400">Stroke</label>
				<div class="flex gap-2">
					<input
						type="color"
						value={selectedEdge.style?.stroke || '#64748b'}
						oninput={(e) => updateEdgeStyle('stroke', e.currentTarget.value)}
						class="h-8 w-8 cursor-pointer rounded border border-slate-600 bg-slate-800 p-0.5"
					/>
					<input
						type="number"
						min="1"
						max="10"
						value={selectedEdge.style?.strokeWidth ?? 2}
						oninput={(e) => updateEdgeStyle('strokeWidth', +e.currentTarget.value)}
						class="h-8 flex-1 rounded border-slate-600 bg-slate-800 text-xs text-slate-200 shadow-sm"
					/>
				</div>
				<select
					value={selectedEdge.style?.strokeDasharray || 'none'}
					onchange={(e) => updateEdgeStyle('strokeDasharray', e.currentTarget.value)}
					class="mt-2 w-full rounded border-slate-600 bg-slate-800 py-1.5 text-xs text-slate-200 shadow-sm"
				>
					<option value="none">Solid</option>
					<option value="5,5">Dashed</option>
					<option value="2,2">Dotted</option>
				</select>
			</div>
			<div class="space-y-2">
				<label class="block text-xs font-semibold text-slate-400">Markers</label>
				<div class="grid grid-cols-2 gap-2">
					<select
						value={selectedEdge.markerStart || 'none'}
						onchange={(e) => updateEdge('markerStart', e.currentTarget.value)}
						class="w-full rounded border-slate-600 bg-slate-800 text-xs text-slate-200"
					>
						<option value="none">None</option>
						<option value="arrow">Arrow</option>
						<option value="circle">Circle</option>
					</select>
					<select
						value={selectedEdge.markerEnd || 'arrow'}
						onchange={(e) => updateEdge('markerEnd', e.currentTarget.value)}
						class="w-full rounded border-slate-600 bg-slate-800 text-xs text-slate-200"
					>
						<option value="none">None</option>
						<option value="arrow">Arrow</option>
						<option value="circle">Circle</option>
					</select>
				</div>
			</div>
			<div class="space-y-2">
				<label class="flex items-center gap-2 text-xs text-slate-400">
					<input
						type="checkbox"
						checked={!!selectedEdge.animated}
						onchange={(e) => updateEdge('animated', e.currentTarget.checked)}
						class="rounded border-slate-600 bg-slate-800 text-indigo-500"
					/>
					Animated
				</label>
			</div>
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center p-8 text-center text-slate-500">
			<div class="space-y-2">
				<p class="text-sm">Select an item to edit properties</p>
			</div>
		</div>
	{/if}
</div>
