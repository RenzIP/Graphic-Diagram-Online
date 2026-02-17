<script lang="ts">
	import type { Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	let w = $derived(node.width || 60);
	let h = $derived(node.height || 90);
	let cx = $derived(w / 2);

	const styleMap: Record<string, string> = {
		slate: 'fill: #1e293b; stroke: rgba(251, 191, 36, 0.7);',
		red: 'fill: rgba(127, 29, 29, 0.4); stroke: #f87171;',
		green: 'fill: rgba(20, 83, 45, 0.4); stroke: #4ade80;',
		amber: 'fill: rgba(120, 53, 15, 0.4); stroke: #fbbf24;',
		indigo: 'fill: rgba(49, 46, 129, 0.4); stroke: #818cf8;',
		cyan: 'fill: rgba(22, 78, 99, 0.4); stroke: #22d3ee;'
	};
	let styleStr = $derived(styleMap[node.color || 'slate'] || styleMap.slate);
</script>

<!-- Use Case Actor Node: stick figure -->
<g style="{styleStr} stroke-width: 1.5;">
	<!-- Head -->
	<circle {cx} cy="12" r="8" />
	<!-- Body -->
	<line x1={cx} y1="20" x2={cx} y2="46" />
	<!-- Arms -->
	<line x1={cx - 16} y1="30" x2={cx + 16} y2="30" />
	<!-- Left leg -->
	<line x1={cx} y1="46" x2={cx - 12} y2="62" />
	<!-- Right leg -->
	<line x1={cx} y1="46" x2={cx + 12} y2="62" />
	<!-- Label -->
	<text
		x={cx}
		y={h - 2}
		text-anchor="middle"
		class="text-[10px] font-medium select-none"
		style="fill: #cbd5e1; font-family: sans-serif; font-size: 10px; font-weight: 500; stroke: none;"
	>
		{node.label}
	</text>
</g>
