<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';
	import { canvasStore } from '$lib/stores/canvas';

	// Helper to get node
	function getNode(id: string) {
		return $documentStore.nodes.find((n) => n.id === id);
	}

	// State for waypoint dragging
	let draggingWaypoint = $state<{
		edgeId: string;
		index: number;
		startX: number;
		startY: number;
	} | null>(null);

	// Grid size for snapping
	const GRID_SIZE = 20;

	function snapToGrid(val: number) {
		return Math.round(val / GRID_SIZE) * GRID_SIZE;
	}

	function handleEndpointMouseDown(
		event: MouseEvent,
		nodeId: string,
		edgeId: string,
		isReversed: boolean
	) {
		event.stopPropagation();
		event.preventDefault();

		const scale = $canvasStore.k;
		const x = (event.clientX - $canvasStore.x) / scale;
		const y = (event.clientY - $canvasStore.y) / scale;

		const edge = $documentStore.edges.find((e) => e.id === edgeId);
		if (!edge) return;

		const sourceId = isReversed ? edge.target : edge.source;
		const handleSide = 'bottom'; // Default

		// Trigger reconnection
		canvasStore.startConnection(sourceId, handleSide, { x, y }, edgeId, isReversed);
	}

	function handleWaypointMouseDown(event: MouseEvent, edgeId: string, index: number) {
		event.stopPropagation();
		event.preventDefault();
		const scale = $canvasStore.k;
		const x = (event.clientX - $canvasStore.x) / scale;
		const y = (event.clientY - $canvasStore.y) / scale;

		draggingWaypoint = { edgeId, index, startX: x, startY: y };
	}

	function handleVirtualHandleMouseDown(event: MouseEvent, edgeId: string, insertIndex: number) {
		event.stopPropagation();
		event.preventDefault();
		const scale = $canvasStore.k;
		const x = (event.clientX - $canvasStore.x) / scale;
		const y = (event.clientY - $canvasStore.y) / scale;

		// Snap initial position
		const snappedX = snapToGrid(x);
		const snappedY = snapToGrid(y);

		// Insert new waypoint at this position
		const edge = $documentStore.edges.find((e) => e.id === edgeId);
		if (edge) {
			const newWaypoints = [...(edge.waypoints || [])];
			newWaypoints.splice(insertIndex, 0, { x: snappedX, y: snappedY });
			documentStore.updateEdge(edgeId, { waypoints: newWaypoints });

			// Start dragging this new waypoint immediately
			draggingWaypoint = { edgeId, index: insertIndex, startX: snappedX, startY: snappedY };
		}
	}

	function handleWaypointDblClick(event: MouseEvent, edgeId: string, index: number) {
		event.stopPropagation();
		// Remove waypoint
		const edge = $documentStore.edges.find((e) => e.id === edgeId);
		if (edge && edge.waypoints) {
			const newWaypoints = [...edge.waypoints];
			newWaypoints.splice(index, 1);
			documentStore.updateEdge(edgeId, { waypoints: newWaypoints });
		}
	}

	function handleWindowMouseMove(event: MouseEvent) {
		const wp = draggingWaypoint;
		if (wp) {
			event.preventDefault();
			const scale = $canvasStore.k;
			const x = (event.clientX - $canvasStore.x) / scale;
			const y = (event.clientY - $canvasStore.y) / scale;

			// Snap to grid
			const snappedX = snapToGrid(x);
			const snappedY = snapToGrid(y);

			const edge = $documentStore.edges.find((e) => e.id === wp.edgeId);
			if (edge && edge.waypoints) {
				const newWaypoints = [...edge.waypoints];
				// Avoid unnecessary updates if snapped pos is same
				if (newWaypoints[wp.index].x !== snappedX || newWaypoints[wp.index].y !== snappedY) {
					newWaypoints[wp.index] = { x: snappedX, y: snappedY };
					documentStore.updateEdge(wp.edgeId, { waypoints: newWaypoints });
				}
			}
		}
	}

	function handleWindowMouseUp() {
		draggingWaypoint = null;
	}

	// Helper for segment midpoint
	function getMidpoint(p1: { x: number; y: number }, p2: { x: number; y: number }) {
		return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
	}
</script>

<svelte:window onmousemove={handleWindowMouseMove} onmouseup={handleWindowMouseUp} />

{#each $selectionStore.edges as edgeId}
	{@const edge = $documentStore.edges.find((e) => e.id === edgeId)}
	{#if edge}
		{@const sourceNode = getNode(edge.source)}
		{@const targetNode = getNode(edge.target)}

		{#if sourceNode && targetNode}
			{@const sourceCenter = {
				x: sourceNode.position.x + (sourceNode.width || 120) / 2,
				y: sourceNode.position.y + (sourceNode.height || 60) / 2
			}}
			{@const targetCenter = {
				x: targetNode.position.x + (targetNode.width || 120) / 2,
				y: targetNode.position.y + (targetNode.height || 60) / 2
			}}

			<!-- Construct full path of points -->
			{@const points = [sourceCenter, ...(edge.waypoints || []), targetCenter]}

			<!-- Render Segments (Virtual Handles) -->
			{#each points as point, i}
				{#if i < points.length - 1}
					{@const nextPoint = points[i + 1]}
					{@const mid = getMidpoint(point, nextPoint)}
					<!-- Virtual Handle for adding waypoint -->
					<circle
						cx={mid.x}
						cy={mid.y}
						r="5"
						class="cursor-pointer fill-indigo-400/50 stroke-none transition-all hover:scale-125 hover:fill-indigo-500"
						onmousedown={(e) => handleVirtualHandleMouseDown(e, edge.id, i)}
						aria-label="Add Waypoint"
						role="button"
						tabindex="0"
					/>
				{/if}
			{/each}

			<!-- Render Waypoints -->
			{#if edge.waypoints}
				{#each edge.waypoints as point, i}
					<rect
						x={point.x - 4}
						y={point.y - 4}
						width="8"
						height="8"
						class="cursor-move fill-indigo-500 stroke-white stroke-1 transition-transform hover:scale-125"
						onmousedown={(e) => handleWaypointMouseDown(e, edge.id, i)}
						ondblclick={(e) => handleWaypointDblClick(e, edge.id, i)}
						role="button"
						tabindex="0"
						aria-label="Move Waypoint"
					/>
				{/each}
			{/if}

			<!-- Source Handle (Endpoint) -->
			<circle
				cx={sourceCenter.x}
				cy={sourceCenter.y}
				r="6"
				class="cursor-move fill-indigo-500 stroke-white stroke-2 transition-transform hover:scale-125"
				onmousedown={(e) => handleEndpointMouseDown(e, edge.source, edge.id, true)}
				role="button"
				tabindex="0"
				aria-label="Move Source Endpoint"
			/>

			<!-- Target Handle (Endpoint) -->
			<circle
				cx={targetCenter.x}
				cy={targetCenter.y}
				r="6"
				class="cursor-move fill-indigo-500 stroke-white stroke-2 transition-transform hover:scale-125"
				onmousedown={(e) => handleEndpointMouseDown(e, edge.source, edge.id, false)}
				role="button"
				tabindex="0"
				aria-label="Move Target Endpoint"
			/>
		{/if}
	{/if}
{/each}
