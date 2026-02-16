<script lang="ts">
	import { type Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	let width = $derived(node.width || 100);
	let height = $derived(node.height || 50);
</script>

<g class="group">
	<rect
		{width}
		{height}
		rx={height / 2}
		class="fill-slate-800 stroke-slate-600 stroke-2 transition-colors group-hover:stroke-indigo-400"
	/>
	<text
		x={width / 2}
		y={height / 2}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none fill-slate-200 text-sm font-medium select-none"
	>
		{node.label}
	</text>
</g>
