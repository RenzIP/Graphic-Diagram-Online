<script lang="ts">
	import { onMount } from 'svelte';
	import { canvasStore } from '$lib/stores/canvas';
	import { documentStore } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';
	import Grid from './Grid.svelte';
	import { type Point, getSmoothPath } from '$lib/utils/geometry';
	import { type Snippet } from 'svelte';

	let {
		children,
		svgElement = $bindable()
	}: {
		children?: Snippet;
		svgElement?: SVGSVGElement;
	} = $props();

	let isPanning = $state(false);
	let lastMousePos = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	let isSpacePressed = $state(false);

	let selectionBox = $state<{
		start: { x: number; y: number };
		current: { x: number; y: number };
		active: boolean;
	}>({
		start: { x: 0, y: 0 },
		current: { x: 0, y: 0 },
		active: false
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space' && !event.repeat) {
			isSpacePressed = true;
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.code === 'Space') {
			isSpacePressed = false;
		}
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		if (event.ctrlKey) {
			// Zoom
			if (!svgElement) return;
			const rect = svgElement.getBoundingClientRect();
			const center = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};

			// Calculate zoom factor
			const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;

			canvasStore.update((t) => {
				const newK = Math.min(Math.max(t.k * zoomFactor, 0.1), 5);
				// Zoom centered on mouse
				return {
					x: center.x - (center.x - t.x) * (newK / t.k),
					y: center.y - (center.y - t.y) * (newK / t.k),
					k: newK
				};
			});
		} else {
			// Pan
			canvasStore.pan(-event.deltaX, -event.deltaY);
		}
	}

	function handleMouseDown(event: MouseEvent) {
		// If clicking on canvas background (target is svg or grid rect)
		const target = event.target as Element;
		if ((target.tagName === 'svg' || target.tagName === 'rect') && event.button === 0) {
			if (event.shiftKey) {
				// Shift + Click = Selection
				const scale = $canvasStore.k;
				const x = (event.clientX - $canvasStore.x) / scale;
				const y = (event.clientY - $canvasStore.y) / scale;

				selectionBox.active = true;
				selectionBox.start = { x, y };
				selectionBox.current = { x, y };
				selectionStore.clear();
			} else {
				// Default Click = Pan
				isPanning = true;
				lastMousePos = { x: event.clientX, y: event.clientY };
				// We don't preventDefault here to allow focus events if needed, but for drag it's often good.
				// event.preventDefault();
			}
		} else if (event.button === 1) {
			// Middle mouse also pans
			isPanning = true;
			lastMousePos = { x: event.clientX, y: event.clientY };
			event.preventDefault();
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (selectionBox.active) {
			const scale = $canvasStore.k;
			const x = (event.clientX - $canvasStore.x) / scale;
			const y = (event.clientY - $canvasStore.y) / scale;
			selectionBox.current = { x, y };
			return;
		}

		if (isPanning) {
			const dx = event.clientX - lastMousePos.x;
			const dy = event.clientY - lastMousePos.y;
			canvasStore.pan(dx, dy);
			lastMousePos = { x: event.clientX, y: event.clientY };
		}

		// Connection logic
		if ($canvasStore.connecting) {
			const scale = $canvasStore.k;
			const x = (event.clientX - $canvasStore.x) / scale;
			const y = (event.clientY - $canvasStore.y) / scale;
			canvasStore.updateConnection({ x, y });
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (selectionBox.active) {
			// Calculate intersection
			const x = Math.min(selectionBox.start.x, selectionBox.current.x);
			const y = Math.min(selectionBox.start.y, selectionBox.current.y);
			const w = Math.abs(selectionBox.current.x - selectionBox.start.x);
			const h = Math.abs(selectionBox.current.y - selectionBox.start.y);

			// Allow small click to clear selection if empty
			if (w < 2 && h < 2) {
				if (!event.shiftKey) selectionStore.clear();
			} else {
				const intersectingNodes = $documentStore.nodes
					.filter((n) => {
						const nx = n.position.x;
						const ny = n.position.y;
						const nw = n.width || 120; // Default width if undefined
						const nh = n.height || 60; // Default height if undefined

						// Simple rectangle intersection
						return nx < x + w && nx + nw > x && ny < y + h && ny + nh > y;
					})
					.map((n) => n.id);

				selectionStore.selectNodes(intersectingNodes, event.shiftKey);
			}

			selectionBox.active = false;
			return;
		}
		isPanning = false;

		// Connection logic
		if ($canvasStore.connecting) {
			canvasStore.endConnection();
		}
	}

	let transform = $derived($canvasStore);
</script>

<svelte:window
	onmouseup={handleMouseUp}
	onmousemove={handleMouseMove}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
/>

<div class="relative h-full w-full overflow-hidden bg-slate-900">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<svg
		bind:this={svgElement}
		class="block h-full w-full cursor-crosshair touch-none active:cursor-grabbing"
		role="application"
		aria-label="Diagram Canvas"
		onwheel={handleWheel}
		onmousedown={handleMouseDown}
	>
		<!-- Background Grid -->
		<Grid />

		<!-- Content Group with Transform -->
		<g transform="translate({$canvasStore.x} {$canvasStore.y}) scale({$canvasStore.k})">
			{@render children?.()}

			<!-- Active Connection Line -->
			{#if $canvasStore.connecting}
				{@const conn = $canvasStore.connecting}
				{@const startNode = $documentStore.nodes.find((n) => n.id === conn.sourceNodeId)}

				{#if startNode}
					{@const startPos = {
						x:
							startNode.position.x +
							(conn.sourceHandle === 'left'
								? 0
								: conn.sourceHandle === 'right'
									? startNode.width || 120
									: (startNode.width || 120) / 2),
						y:
							startNode.position.y +
							(conn.sourceHandle === 'top'
								? 0
								: conn.sourceHandle === 'bottom'
									? startNode.height || 60
									: (startNode.height || 60) / 2)
					}}

					<path
						d={getSmoothPath(startPos, conn.mousePos, conn.sourceHandle, 'top')}
						class="pointer-events-none stroke-indigo-500 stroke-2"
						stroke-dasharray="5,5"
						fill="none"
					/>
					<!-- Target Snap Indicator -->
					{#if conn.candidateNodeId}
						{@const targetNode = $documentStore.nodes.find((n) => n.id === conn.candidateNodeId)}
						{#if targetNode}
							<rect
								x={targetNode.position.x - 4}
								y={targetNode.position.y - 4}
								width={(targetNode.width || 120) + 8}
								height={(targetNode.height || 60) + 8}
								rx="8"
								class="dashed pointer-events-none fill-none stroke-indigo-400 stroke-2"
								stroke-dasharray="4"
							/>
						{/if}
					{/if}
				{/if}
			{/if}

			<!-- Selection Box -->
			{#if selectionBox.active}
				{@const x = Math.min(selectionBox.start.x, selectionBox.current.x)}
				{@const y = Math.min(selectionBox.start.y, selectionBox.current.y)}
				{@const w = Math.abs(selectionBox.current.x - selectionBox.start.x)}
				{@const h = Math.abs(selectionBox.current.y - selectionBox.start.y)}
				<rect
					{x}
					{y}
					width={w}
					height={h}
					class="pointer-events-none fill-indigo-500/10 stroke-indigo-500 stroke-1"
				/>
			{/if}
		</g>
	</svg>

	<!-- Overlay Controls (Zoom info, etc) -->
	<div
		class="absolute right-4 bottom-4 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300 shadow-lg"
	>
		{Math.round(transform.k * 100)}%
	</div>
</div>
