<script lang="ts">
	import { documentStore, type NodeType } from '$lib/stores/document';
	import { NODE_SHAPES } from '$lib/utils/constants';

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
		erd: 'Entity Relation',
		usecase: 'UML Use Case',
		sequence: 'UML Sequence',
		mindmap: 'Mind Map'
	};

	// Determine which categories to show
	let categories = $derived.by(() => {
		const allKeys = Object.keys(NODE_SHAPES).filter((k) => k !== 'all' && k !== 'blank');
		// Fixed order
		const ORDER = ['general', 'flowchart', 'arrows', 'erd', 'usecase', 'sequence', 'mindmap'];
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
		[diagramType]: true
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
			// Auto-size or default size based on type?
			// Generic default:
			width: 120,
			height: 60,
			label: label || 'New Node'
		});
	}
</script>

<aside class="flex w-60 flex-col border-r border-[#303030] bg-[#1e1e1e] select-none">
	<!-- Tools / Header -->
	<div class="border-b border-[#303030] px-4 py-3">
		<h3 class="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Shapes</h3>
	</div>

	<!-- Scrollable Content -->
	<div class="custom-scrollbar flex-1 overflow-y-auto">
		<!-- Tools Section (Always visible) -->
		<div class="border-b border-[#303030]">
			<button
				class="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#2a2a2a]"
				onclick={() => toggleCategory('tools')}
			>
				<span>General</span>
				<span class="text-[10px] text-gray-500">{expanded['tools'] !== false ? '▼' : '▶'}</span>
			</button>
			{#if expanded['tools'] !== false}
				<div class="grid grid-cols-4 gap-2 bg-[#1e1e1e] p-3">
					<!-- Text Tool -->
					<button
						class="group relative flex flex-col items-center justify-center rounded p-1 text-gray-400 hover:bg-[#303030] hover:text-white"
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
						class="flex flex-col items-center justify-center rounded p-1 text-gray-400 hover:bg-[#303030] hover:text-white"
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
				<div class="border-b border-[#303030]">
					<button
						class="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#2a2a2a]"
						onclick={() => toggleCategory(catKey)}
					>
						<span>{CATEGORY_NAMES[catKey] || catKey}</span>
						<span class="text-[10px] text-gray-500">{expanded[catKey] ? '▼' : '▶'}</span>
					</button>

					{#if expanded[catKey]}
						<div class="grid grid-cols-3 gap-2 bg-[#1e1e1e] p-3">
							{#each NODE_SHAPES[catKey] as shape}
								<button
									class="group flex flex-col items-center justify-center rounded border border-transparent p-1.5 transition-all hover:border-[#4a4a4a] hover:bg-[#2a2a2a]"
									onclick={() => addNode(shape.type, shape.label)}
									title={shape.label}
								>
									<!-- Icon rendering -->
									<div
										class="flex h-8 w-8 items-center justify-center text-gray-300 group-hover:text-white"
									>
										{#if shape.icon && shape.icon.length < 5}
											<!-- Emoji/Text Icon -->
											<span class="text-xl leading-none">{shape.icon}</span>
										{:else}
											<!-- SVG Path or image? Assuming text/emoji for now as per constants.ts -->
											<span class="text-lg">{shape.icon}</span>
										{/if}
									</div>
									<span
										class="mt-1 w-full truncate text-center text-[9px] text-gray-500 group-hover:text-gray-300"
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
