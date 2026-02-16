<script lang="ts">
	import type { Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	let w = $derived(node.width || 120);
	let h = $derived(node.height || 80);
</script>

<!-- ERD Entity Node: table-like shape with header -->
<g>
	<!-- Shadow -->
	<rect x="2" y="2" width={w} height={h} rx="4" class="fill-black/20" />
	<!-- Body -->
	<rect width={w} height={h} rx="4" class="fill-slate-800 stroke-emerald-500/60 stroke-[1.5]" />
	<!-- Header bar -->
	<rect width={w} height={24} rx="4" class="fill-emerald-500/20" />
	<rect y="20" width={w} height="4" class="fill-emerald-500/20" />
	<!-- Divider -->
	<line x1="0" y1="24" x2={w} y2="24" class="stroke-emerald-500/30 stroke-1" />
	<!-- Label -->
	<text x={w / 2} y="16" text-anchor="middle" class="fill-emerald-400 text-[11px] font-bold">
		{node.label}
	</text>
	<!-- Attribute placeholder -->
	<text
		x={w / 2}
		y={24 + (h - 24) / 2 + 4}
		text-anchor="middle"
		class="fill-slate-500 text-[10px] italic"
	>
		(attributes)
	</text>
</g>
