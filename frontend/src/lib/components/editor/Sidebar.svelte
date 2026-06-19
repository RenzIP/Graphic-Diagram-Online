<script lang="ts">
	import { documentStore, type NodeType } from '$lib/stores/document';
	import { NODE_SHAPES } from '$lib/utils/constants';
	import { getShapePath } from '$lib/utils/shapes';

	let {
		diagramType = 'flowchart'
	}: {
		diagramType?: string;
	} = $props();

	// Map internal types to display names
	const CATEGORY_NAMES: Record<string, string> = {
		general: 'General',
		flowchart: 'Flowchart',
		arrows: 'Arrows',
		uml: 'UML / Class / Sequence',
		erd: 'Entity Relation',
		bpmn: 'BPMN 2.0',
		network: 'Cloud / Network'
	};

	let searchQuery = $state('');

	// Determine which categories to show
	let categories = $derived.by(() => {
		const allKeys = Object.keys(NODE_SHAPES).filter((k) => k !== 'all' && k !== 'blank');
		// Fixed order
		const ORDER = ['general', 'flowchart', 'arrows', 'uml', 'erd', 'bpmn', 'network'];

		// If searching, show all categories that have matches
		if (searchQuery) {
			return allKeys
				.filter((k) => {
					const shapes = NODE_SHAPES[k];
					return shapes.some((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()));
				})
				.sort((a, b) => {
					const ia = ORDER.indexOf(a);
					const ib = ORDER.indexOf(b);
					return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
				});
		}

		return allKeys.sort((a, b) => {
			const ia = ORDER.indexOf(a);
			const ib = ORDER.indexOf(b);
			return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
		});
	});

	// Track expanded state
	let expanded = $state<Record<string, boolean>>({
		tools: false,
		general: true,
		flowchart: false,
		arrows: false,
		uml: false,
		erd: false,
		bpmn: false,
		network: false
	});

	$effect(() => {
		if (diagramType in expanded) {
			expanded[diagramType] = true;
		}
	});

	// Auto-expand search results
	$effect(() => {
		if (searchQuery) {
			const newExpanded = { ...expanded };
			categories.forEach((c) => (newExpanded[c] = true));
			expanded = newExpanded; 
		}
	});

	function toggleCategory(cat: string) {
		expanded[cat] = !expanded[cat];
	}

	function addNode(type: string, label: string) {
		const id = crypto.randomUUID();
		documentStore.addNode({
			id,
			type: type as NodeType,
			position: { x: 200 + Math.random() * 50, y: 150 + Math.random() * 50 },
			width: 120,
			height: 60,
			label: label || 'New Node'
		});
	}

	function getShapes(cat: string) {
		let shapes = NODE_SHAPES[cat] || [];
		if (searchQuery) {
			shapes = shapes.filter((s) => s.label.toLowerCase().includes(searchQuery.toLowerCase()));
		}
		return shapes;
	}
</script>

<aside
	class="z-10 flex h-full w-60 flex-col border-r border-white/5 bg-background/90 backdrop-blur-xl shadow-xl select-none"
>
	<!-- Tools / Header -->
	<div class="space-y-3 border-b border-white/5 px-4 py-3 bg-surface/50">
		<h3 class="text-[11px] font-bold tracking-wider text-text-tertiary uppercase font-outfit">Shapes</h3>
		<!-- Search Bar -->
		<div class="relative">
			<svg
				class="absolute top-1.5 left-2 h-4 w-4 text-text-tertiary"
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
			<input
				type="text"
				placeholder="Search..."
				bind:value={searchQuery}
				class="w-full rounded border border-white/5 bg-surface py-1 pr-2 pl-8 text-xs text-text-secondary placeholder-text-tertiary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors"
			/>
		</div>
	</div>

	<!-- Scrollable Content -->
	<div class="custom-scrollbar flex-1 overflow-y-auto">
		<!-- Tools Section (Always visible) -->
		<div class="border-b border-white/5">
			<button
				class="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface/50"
				onclick={() => toggleCategory('tools')}
			>
				<span>General</span>
				<span class="text-[10px] text-text-tertiary">{expanded['tools'] !== false ? '▼' : '▶'}</span>
			</button>
			{#if expanded['tools'] !== false}
				<div class="grid grid-cols-4 gap-2 bg-background/50 p-3">
					<!-- Text Tool -->
					<button
						class="group relative flex flex-col items-center justify-center rounded-lg p-1 text-text-tertiary hover:bg-surface hover:text-white transition-colors"
						onclick={() => addNode('text', 'Text')}
						title="Text"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M4 6h16M4 12h16M4 18h7"
							/>
						</svg>
					</button>
					<!-- Connector Tool (just hint) -->
					<button
						class="flex flex-col items-center justify-center rounded-lg p-1 text-text-tertiary hover:bg-surface hover:text-white transition-colors"
						onclick={() => alert('Drag from any node handle to create a connection!')}
						title="Connection"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</button>
				</div>
			{/if}
		</div>

		<!-- Dynamic Categories -->
		{#each categories as catKey}
			{#if NODE_SHAPES[catKey]}
				<div class="border-b border-white/5">
					<button
						class="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface/50"
						onclick={() => toggleCategory(catKey)}
					>
						<span>{CATEGORY_NAMES[catKey] || catKey}</span>
						<span class="text-[10px] text-text-tertiary">{expanded[catKey] ? '▼' : '▶'}</span>
					</button>

					{#if expanded[catKey]}
						<div class="grid grid-cols-3 gap-2 bg-background/50 p-3">
							{#each getShapes(catKey) as shape}
								<button
									class="group relative flex flex-col items-center justify-center rounded-lg border border-transparent p-1.5 transition-all hover:border-white/10 hover:bg-surface"
									onclick={() => addNode(shape.type, shape.label)}
									title={shape.label}
									draggable="true"
									ondragstart={(e) => {
										e.dataTransfer?.setData(
											'application/gradiol-node',
											JSON.stringify({ type: shape.type, label: shape.label })
										);
										e.dataTransfer?.setDragImage(e.currentTarget, 20, 20);
									}}
								>
									<!-- Icon rendering -->
									<div
										class="flex h-8 w-8 items-center justify-center text-text-tertiary transition-colors group-hover:text-white"
									>
										{#if shape.type === 'text'}
											<span class="font-serif text-xl font-bold">T</span>
										{:else}
											<!-- SVG Preview -->
											<svg
												viewBox="0 0 40 40"
												class="h-7 w-7 fill-none stroke-current opacity-80 group-hover:opacity-100"
												stroke-width="2"
												stroke-linejoin="round"
												stroke-linecap="round"
											>
												<path
													d={getShapePath(shape.type, 40, 40)}
													vector-effect="non-scaling-stroke"
												/>
											</svg>
										{/if}
									</div>
									<span
										class="mt-1 w-full truncate text-center text-[9px] text-text-secondary group-hover:text-white"
										>{shape.label}</span
									>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</aside>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1); /* white/10 */
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2); /* white/20 */
	}
</style>
