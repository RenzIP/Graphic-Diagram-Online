<script lang="ts">
	import type { Edge, Node } from '$lib/stores/document';

	let {
		edge,
		sourceNode,
		targetNode
	}: {
		edge: Edge;
		sourceNode: Node;
		targetNode: Node;
	} = $props();

	let sx = $derived(sourceNode.position.x + (sourceNode.width || 120) / 2);
	let sy = $derived(sourceNode.position.y + (sourceNode.height || 60));
	let tx = $derived(targetNode.position.x + (targetNode.width || 120) / 2);
	let ty = $derived(targetNode.position.y);

	let path = $derived(`M ${sx} ${sy} L ${tx} ${ty}`);
</script>

<g class="pointer-events-auto">
	<!-- Relation line -->
	<line
		x1={sx}
		y1={sy}
		x2={tx}
		y2={ty}
		class="stroke-emerald-500/60 stroke-[1.5] transition-colors hover:stroke-emerald-400"
	/>
	<!-- Crow's foot markers (simplified) -->
	{#if edge.label}
		<text x={(sx + tx) / 2 + 8} y={(sy + ty) / 2 - 6} class="fill-emerald-400 text-[10px]">
			{edge.label}
		</text>
	{/if}
</g>
