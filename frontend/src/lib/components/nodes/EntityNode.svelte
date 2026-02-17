<script lang="ts">
	import type { Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	let w = $derived(node.width || 120);
	let h = $derived(node.height || 80);
	const themes: Record<string, any> = {
		slate: {
			bodyFill: '#1e293b',
			bodyStroke: '#475569',
			headerFill: 'rgba(148, 163, 184, 0.2)',
			dividerStroke: 'rgba(148, 163, 184, 0.3)',
			labelFill: '#94a3b8'
		},
		red: {
			bodyFill: '#1e293b',
			bodyStroke: 'rgba(239, 68, 68, 0.6)',
			headerFill: 'rgba(239, 68, 68, 0.2)',
			dividerStroke: 'rgba(239, 68, 68, 0.3)',
			labelFill: '#f87171'
		},
		green: {
			bodyFill: '#1e293b',
			bodyStroke: 'rgba(16, 185, 129, 0.6)',
			headerFill: 'rgba(16, 185, 129, 0.2)',
			dividerStroke: 'rgba(16, 185, 129, 0.3)',
			labelFill: '#34d399'
		},
		amber: {
			bodyFill: '#1e293b',
			bodyStroke: 'rgba(251, 191, 36, 0.6)',
			headerFill: 'rgba(251, 191, 36, 0.2)',
			dividerStroke: 'rgba(251, 191, 36, 0.3)',
			labelFill: '#fbbf24'
		},
		indigo: {
			bodyFill: '#1e293b',
			bodyStroke: 'rgba(99, 102, 241, 0.6)',
			headerFill: 'rgba(99, 102, 241, 0.2)',
			dividerStroke: 'rgba(99, 102, 241, 0.3)',
			labelFill: '#818cf8'
		},
		cyan: {
			bodyFill: '#1e293b',
			bodyStroke: 'rgba(6, 182, 212, 0.6)',
			headerFill: 'rgba(6, 182, 212, 0.2)',
			dividerStroke: 'rgba(6, 182, 212, 0.3)',
			labelFill: '#22d3ee'
		}
	};

	let theme = $derived(themes[node.color || 'green'] || themes.green);
</script>

<!-- ERD Entity Node: table-like shape with header -->
<g>
	<!-- Shadow -->
	<rect x="2" y="2" width={w} height={h} rx="4" style="fill: rgba(0,0,0,0.2);" />
	<!-- Body -->
	<rect
		width={w}
		height={h}
		rx="4"
		style="fill: {theme.bodyFill}; stroke: {theme.bodyStroke}; stroke-width: 1.5;"
	/>
	<!-- Header bar -->
	<rect width={w} height={24} rx="4" style="fill: {theme.headerFill};" />
	<rect y="20" width={w} height="4" style="fill: {theme.headerFill};" />
	<!-- Divider -->
	<line x1="0" y1="24" x2={w} y2="24" style="stroke: {theme.dividerStroke}; stroke-width: 1;" />
	<!-- Label -->
	<text
		x={w / 2}
		y={16}
		text-anchor="middle"
		class="text-[11px] font-bold select-none"
		style="fill: {theme.labelFill}; font-family: sans-serif; font-size: 11px; font-weight: 700;"
	>
		{node.label}
	</text>
	<!-- Attribute placeholder -->
	<text
		x={w / 2}
		y={24 + (h - 24) / 2 + 4}
		text-anchor="middle"
		class="text-[10px] italic select-none"
		style="fill: #64748b; font-family: sans-serif; font-size: 10px; font-style: italic;"
	>
		(attributes)
	</text>
</g>
