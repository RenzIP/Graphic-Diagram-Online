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

	// Arrowhead path
	let path = $derived.by(() => {
		const dx = tx - sx;
		const dy = ty - sy;
		const midY = sy + dy / 2;
		return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
	});
</script>

<g class="pointer-events-auto">
	<!-- Edge path -->
	<path
		d={path}
		class="fill-none stroke-slate-500 stroke-[1.5] transition-colors hover:stroke-indigo-400"
		marker-end="url(#arrowhead)"
	/>
	<!-- Label -->
	{#if edge.label}
		<text
			x={(sx + tx) / 2}
			y={(sy + ty) / 2 - 6}
			text-anchor="middle"
			class="fill-slate-400 text-[10px]"
		>
			{edge.label}
		</text>
	{/if}
</g>
