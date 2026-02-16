<script lang="ts">
	import { type Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	let width = $derived(node.width || 100);
	let height = $derived(node.height || 100);
	let halfW = $derived((node.width || 100) / 2);
	let halfH = $derived((node.height || 100) / 2);
</script>

<g class="group">
	<polygon
		points="{halfW},0 {width},{halfH} {halfW},{height} 0,{halfH}"
		class="fill-slate-800 stroke-slate-600 stroke-2 transition-colors group-hover:stroke-indigo-400"
	/>
	<text
		x={halfW}
		y={halfH}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none fill-slate-200 text-sm font-medium select-none"
	>
		{node.label}
	</text>
</g>
