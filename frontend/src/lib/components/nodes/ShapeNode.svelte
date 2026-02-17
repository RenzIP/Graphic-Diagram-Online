<script lang="ts">
	import { type Node } from '$lib/stores/document';
	import { getShapePath } from '$lib/utils/shapes';

	let { node }: { node: Node } = $props();

	// Legacy Color variants fallback
	const styleMap: Record<string, { fill: string; stroke: string }> = {
		slate: { fill: '#1e293b', stroke: '#475569' },
		red: { fill: 'rgba(127, 29, 29, 0.4)', stroke: '#ef4444' },
		green: { fill: 'rgba(20, 83, 45, 0.4)', stroke: '#22c55e' },
		amber: { fill: 'rgba(120, 53, 15, 0.4)', stroke: '#f59e0b' },
		indigo: { fill: 'rgba(49, 46, 129, 0.4)', stroke: '#6366f1' },
		cyan: { fill: 'rgba(22, 78, 99, 0.4)', stroke: '#06b6d4' },
		white: { fill: '#ffffff', stroke: '#94a3b8' }
	};

	const fallback = styleMap[node.color || 'slate'] || styleMap.slate;

	let w = $derived(node.width || 120);
	let h = $derived(node.height || 60);

	// Get generic path
	let d = $derived(getShapePath(node.type, w, h));

	// Style Derivations
	let fill = $derived(node.style?.fill || fallback.fill);
	let stroke = $derived(node.style?.stroke || fallback.stroke);
	let strokeWidth = $derived(node.style?.strokeWidth || 2);
	let strokeDasharray = $derived(node.style?.strokeDasharray || 'none');

	// Text Style
	let textColor = $derived(node.style?.color || (node.color === 'white' ? '#1e293b' : '#e2e8f0'));
	let fontSize = $derived(node.style?.fontSize || 14);
	let fontFamily = $derived(node.style?.fontFamily || 'sans-serif');
	let fontWeight = $derived(node.style?.fontWeight || '500');

	// Effects
	// We can add a simple shadow via CSS filter if requested (not yet in PropertyPanel data, but good to have ready)
	let filter = $derived(
		node.style?.opacity && node.style.opacity < 1 ? `opacity: ${node.style.opacity}` : ''
	);
</script>

<g class="group" style={filter}>
	<path
		{d}
		class="transition-colors group-hover:stroke-indigo-400"
		{fill}
		{stroke}
		stroke-width={strokeWidth}
		stroke-dasharray={strokeDasharray}
		stroke-linejoin="round"
	/>

	<!-- Label -->
	<foreignObject x={0} y={0} width={w} height={h} style="pointer-events: none;">
		<div
			class="flex h-full w-full items-center justify-center overflow-hidden p-2 text-center break-words"
			style="
                color: {textColor};
                font-family: {fontFamily};
                font-size: {fontSize}px;
                font-weight: {fontWeight};
                line-height: 1.2;
             "
		>
			{node.label}
		</div>
	</foreignObject>
</g>
