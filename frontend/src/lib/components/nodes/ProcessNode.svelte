<script lang="ts">
	import { type Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	const colorMap: Record<string, string> = {
		slate: 'fill-slate-800 stroke-slate-600 group-hover:stroke-indigo-400',
		red: 'fill-red-900/40 stroke-red-500 group-hover:stroke-red-400',
		green: 'fill-green-900/40 stroke-green-500 group-hover:stroke-green-400',
		amber: 'fill-amber-900/40 stroke-amber-500 group-hover:stroke-amber-400',
		indigo: 'fill-indigo-900/40 stroke-indigo-500 group-hover:stroke-indigo-400',
		cyan: 'fill-cyan-900/40 stroke-cyan-500 group-hover:stroke-cyan-400'
	};

	let colorClass = $derived(colorMap[node.color || 'slate'] || colorMap.slate);
</script>

<g class="group">
	<rect
		width={node.width || 120}
		height={node.height || 60}
		rx="6"
		class="{colorClass} stroke-2 transition-colors"
	/>
	<text
		x={(node.width || 120) / 2}
		y={(node.height || 60) / 2}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none fill-slate-200 text-sm font-medium select-none"
	>
		{node.label}
	</text>
</g>
