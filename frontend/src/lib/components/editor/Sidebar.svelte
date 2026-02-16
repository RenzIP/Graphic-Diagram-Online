<script lang="ts">
	import { documentStore, type NodeType } from '$lib/stores/document';
	import { NODE_SHAPES } from '$lib/utils/constants';

	let {
		diagramType = 'flowchart'
	}: {
		diagramType?: string;
	} = $props();

	let shapes = $derived(NODE_SHAPES[diagramType] || NODE_SHAPES.flowchart);

	function addNode(type: string) {
		const id = crypto.randomUUID();
		documentStore.addNode({
			id,
			type: type as NodeType,
			position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 100 },
			width: 120,
			height: 60,
			label: 'New Node'
		});
	}
</script>

<aside class="flex w-56 flex-col border-r border-slate-800 bg-slate-900">
	<!-- Header -->
	<div class="border-b border-slate-800 px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Shapes</h3>
	</div>

	<!-- Shape list -->
	<div class="flex-1 overflow-y-auto p-3">
		<div class="space-y-2">
			{#each shapes as shape}
				<button
					class="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2.5 text-left text-sm text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white"
					onclick={() => addNode(shape.type)}
				>
					<span class="flex h-8 w-8 items-center justify-center rounded bg-slate-700/50 text-base">
						{shape.icon}
					</span>
					<span class="font-medium">{shape.label}</span>
				</button>
			{/each}
		</div>

		<div class="mt-4 border-t border-slate-800 pt-4">
			<h4 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Tools</h4>
			<div class="space-y-2">
				<button
					class="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2.5 text-left text-sm text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
				>
					<span class="flex h-8 w-8 items-center justify-center rounded bg-slate-700/50">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					</span>
					<span class="font-medium">Text</span>
				</button>
				<button
					class="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2.5 text-left text-sm text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
				>
					<span class="flex h-8 w-8 items-center justify-center rounded bg-slate-700/50">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
					</span>
					<span class="font-medium">Connector</span>
				</button>
			</div>
		</div>
	</div>
</aside>
