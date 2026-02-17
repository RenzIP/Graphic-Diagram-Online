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

	let styleStr = $derived(styleMap[node.color || 'slate'] || styleMap.slate);
	let w = $derived(node.width || 120);
	// Head height fixed or prop? NodeWrapper uses node.height for bounds.
	// Lifeline usually has a box at top and line down.
	// We'll use node.height for the box size, but draw a line extending down?
	// NodeWrapper handles selection box based on node.width/height.
	// If we want a long line, the node height should ostensibly include it, or we draw outside bounds.
	// If we draw outside bounds, selection box won't cover it.
	// Let's assume node.height IS the lifeline length.
	// But usually you resize lifeline length.
	let h = $derived(node.height || 300);
	let headH = 50;
</script>

<g class="group">
	<!-- Head Box -->
	<rect
		width={w}
		height={headH}
		rx="4"
		class="stroke-2 transition-colors group-hover:!stroke-indigo-400"
		style={styleStr}
	/>

	<!-- Label in Head -->
	<text
		x={w / 2}
		y={headH / 2}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none text-sm font-medium select-none"
		style="fill: #e2e8f0; font-family: sans-serif; font-size: 14px; font-weight: 500;"
	>
		{node.label}
	</text>

	<!-- Dashed Line -->
	<line
		x1={w / 2}
		y1={headH}
		x2={w / 2}
		y2={h}
		stroke="currentColor"
		stroke-width="2"
		stroke-dasharray="8 8"
		class="text-slate-500"
	/>
</g>
