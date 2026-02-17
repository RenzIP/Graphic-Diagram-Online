<script lang="ts">
	import { type Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	const styleMap: Record<string, string> = {
		slate: 'fill: #1e293b; stroke: #475569;',
		red: 'fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;',
		green: 'fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;',
		amber: 'fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;',
		indigo: 'fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;',
		cyan: 'fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;'
	};

	let width = $derived(node.width || 100);
	let height = $derived(node.height || 50);
	let styleStr = $derived(styleMap[node.color || 'slate'] || styleMap.slate);
</script>

<g class="group">
	<rect
		{width}
		{height}
		rx={height / 2}
		class="stroke-2 transition-colors group-hover:!stroke-indigo-400"
		style={styleStr}
	/>
	<text
		x={width / 2}
		y={height / 2}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none text-sm font-medium select-none"
		style="fill: #e2e8f0; font-family: sans-serif; font-size: 14px; font-weight: 500;"
	>
		{node.label}
	</text>
</g>
