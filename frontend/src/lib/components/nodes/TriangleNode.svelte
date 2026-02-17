<script lang="ts">
	import { type Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	// Color variants
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
	let h = $derived(node.height || 60);

	// Triangle pointing up
	let points = $derived(`${w / 2},0 ${w},${h} 0,${h}`);
</script>

<g class="group">
	<polygon
		{points}
		class="stroke-2 transition-colors group-hover:!stroke-indigo-400"
		style={styleStr}
	/>
	<!-- Center text, adjusted slightly down since top is pointy -->
	<text
		x={w / 2}
		y={h * 0.65}
		dominant-baseline="middle"
		text-anchor="middle"
		class="pointer-events-none text-sm font-medium select-none"
		style="fill: #e2e8f0; font-family: sans-serif; font-size: 14px; font-weight: 500;"
	>
		{node.label}
	</text>
</g>
