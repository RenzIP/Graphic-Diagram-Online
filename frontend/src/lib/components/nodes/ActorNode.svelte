<script lang="ts">
	import type { Node } from '$lib/stores/document';

	let { node }: { node: Node } = $props();

	let w = $derived(node.width || 60);
	let h = $derived(node.height || 90);
	let cx = $derived(w / 2);
</script>

<!-- Use Case Actor Node: stick figure -->
<g>
	<!-- Head -->
	<circle {cx} cy="12" r="8" class="fill-slate-800 stroke-amber-400/70 stroke-[1.5]" />
	<!-- Body -->
	<line x1={cx} y1="20" x2={cx} y2="46" class="stroke-amber-400/70 stroke-[1.5]" />
	<!-- Arms -->
	<line x1={cx - 16} y1="30" x2={cx + 16} y2="30" class="stroke-amber-400/70 stroke-[1.5]" />
	<!-- Left leg -->
	<line x1={cx} y1="46" x2={cx - 12} y2="62" class="stroke-amber-400/70 stroke-[1.5]" />
	<!-- Right leg -->
	<line x1={cx} y1="46" x2={cx + 12} y2="62" class="stroke-amber-400/70 stroke-[1.5]" />
	<!-- Label -->
	<text x={cx} y={h - 2} text-anchor="middle" class="fill-slate-300 text-[10px] font-medium">
		{node.label}
	</text>
</g>
