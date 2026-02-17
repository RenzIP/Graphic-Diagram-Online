<script lang="ts">
	import { type Node } from '$lib/stores/document';
	import { getShapePath } from '$lib/utils/shapes';

	let { node }: { node: Node } = $props();

	// Color variants
	const styleMap: Record<string, string> = {
		slate: 'fill: #1e293b; stroke: #475569;',
		red: 'fill: rgba(127, 29, 29, 0.4); stroke: #ef4444;',
		green: 'fill: rgba(20, 83, 45, 0.4); stroke: #22c55e;',
		amber: 'fill: rgba(120, 53, 15, 0.4); stroke: #f59e0b;',
		indigo: 'fill: rgba(49, 46, 129, 0.4); stroke: #6366f1;',
		cyan: 'fill: rgba(22, 78, 99, 0.4); stroke: #06b6d4;',
		white: 'fill: #ffffff; stroke: #94a3b8;'
	};

	let styleStr = $derived(styleMap[node.color || 'slate'] || styleMap.slate);
	let w = $derived(node.width || 120);
	let h = $derived(node.height || 60);

	// Get generic path
	let d = $derived(getShapePath(node.type, w, h));
</script>

<g class="group">
	<path
		{d}
		class="stroke-2 transition-colors group-hover:!stroke-indigo-400"
		style={styleStr}
		stroke-linejoin="round"
	/>

	<!-- Label Positioning -->
	<!-- For some shapes (like generic Note or Display), center might need offset. 
         For now, keeping it simple center, assuming shapes are roughly centered. -->
	<text
		x={w / 2}
		y={h / 2}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none text-sm font-medium select-none"
		style="fill: {node.color === 'white'
			? '#1e293b'
			: '#e2e8f0'}; font-family: sans-serif; font-size: 14px; font-weight: 500;"
	>
		{node.label}
	</text>
</g>
