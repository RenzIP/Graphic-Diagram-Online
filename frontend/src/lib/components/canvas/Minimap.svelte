<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { canvasStore } from '$lib/stores/canvas';

	const MINIMAP_WIDTH = 160;
	const MINIMAP_HEIGHT = 100;

	// Derive a scaled-down view of all nodes
	let bounds = $derived.by(() => {
		const nodes = $documentStore.nodes;
		if (nodes.length === 0) return { x: 0, y: 0, width: 800, height: 600 };

		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		for (const node of nodes) {
			minX = Math.min(minX, node.position.x);
			minY = Math.min(minY, node.position.y);
			maxX = Math.max(maxX, node.position.x + (node.width || 120));
			maxY = Math.max(maxY, node.position.y + (node.height || 60));
		}

		const padding = 100;
		return {
			x: minX - padding,
			y: minY - padding,
			width: maxX - minX + padding * 2,
			height: maxY - minY + padding * 2
		};
	});

	let scale = $derived(Math.min(MINIMAP_WIDTH / bounds.width, MINIMAP_HEIGHT / bounds.height));

	// Viewport rectangle
	let viewport = $derived.by(() => {
		const vw = (typeof window !== 'undefined' ? window.innerWidth : 1200) / $canvasStore.k;
		const vh = (typeof window !== 'undefined' ? window.innerHeight : 800) / $canvasStore.k;
		const vx = -$canvasStore.x / $canvasStore.k;
		const vy = -$canvasStore.y / $canvasStore.k;
		return {
			x: (vx - bounds.x) * scale,
			y: (vy - bounds.y) * scale,
			width: vw * scale,
			height: vh * scale
		};
	});
</script>

<div
	class="absolute right-3 bottom-3 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/80 shadow-lg backdrop-blur-sm"
>
	<svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} class="block">
		<!-- Background -->
		<rect width="100%" height="100%" fill="transparent" />

		<!-- Nodes -->
		{#each $documentStore.nodes as node}
			<rect
				x={(node.position.x - bounds.x) * scale}
				y={(node.position.y - bounds.y) * scale}
				width={(node.width || 120) * scale}
				height={(node.height || 60) * scale}
				rx="1"
				class="fill-indigo-500/60"
			/>
		{/each}

		<!-- Edges -->
		{#each $documentStore.edges as edge}
			{@const source = $documentStore.nodes.find((n) => n.id === edge.source)}
			{@const target = $documentStore.nodes.find((n) => n.id === edge.target)}
			{#if source && target}
				<line
					x1={(source.position.x + (source.width || 120) / 2 - bounds.x) * scale}
					y1={(source.position.y + (source.height || 60) / 2 - bounds.y) * scale}
					x2={(target.position.x + (target.width || 120) / 2 - bounds.x) * scale}
					y2={(target.position.y + (target.height || 60) / 2 - bounds.y) * scale}
					class="stroke-slate-500/40"
					stroke-width="0.5"
				/>
			{/if}
		{/each}

		<!-- Viewport -->
		<rect
			x={viewport.x}
			y={viewport.y}
			width={viewport.width}
			height={viewport.height}
			rx="1"
			class="fill-white/5 stroke-cyan-400/60"
			stroke-width="1"
		/>
	</svg>
</div>
