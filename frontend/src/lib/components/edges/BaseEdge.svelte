<script lang="ts">
	import {
		getSmoothPath,
		getStraightPath,
		getOrthogonalPath,
		getNodeBoundaryPoint
	} from '$lib/utils/geometry';
	import { getPathByRouting, type RoutingType } from '$lib/utils/routing';
	import { canvasStore } from '$lib/stores/canvas';
	import { documentStore, type Edge, type Node } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';

	let { edge, sourceNode, targetNode }: { edge: Edge; sourceNode: Node; targetNode: Node } =
		$props();

	// Calculate center coordinates
	let sourceCenter = $derived({
		x: sourceNode.position.x + (sourceNode.width || 120) / 2,
		y: sourceNode.position.y + (sourceNode.height || 60) / 2
	});

	let targetCenter = $derived({
		x: targetNode.position.x + (targetNode.width || 120) / 2,
		y: targetNode.position.y + (targetNode.height || 60) / 2
	});

	// Exact intersection boundary points
	let sourcePoint = $derived.by(() => {
		const targetPointForBoundary = (edge.waypoints && edge.waypoints.length > 0) 
			? edge.waypoints[0] 
			: targetCenter;
		return getNodeBoundaryPoint(sourceNode, targetPointForBoundary);
	});

	let targetPoint = $derived.by(() => {
		const sourcePointForBoundary = (edge.waypoints && edge.waypoints.length > 0) 
			? edge.waypoints[edge.waypoints.length - 1] 
			: sourceCenter;
		return getNodeBoundaryPoint(targetNode, sourcePointForBoundary);
	});

	let isSelected = $derived($selectionStore.edges.includes(edge.id));

	// Visual Styles
	let strokeColor = $derived(isSelected ? '#6366f1' : edge.style?.stroke || '#64748b');
	// Increase width on select
	let strokeWidth = $derived((edge.style?.strokeWidth || 2) + (isSelected ? 1 : 0));

	let strokeDasharray = $derived.by(() => {
		if (edge.style?.strokeDasharray) return edge.style.strokeDasharray;
		if (edge.animated) return '5,5'; // Animation usually needs dash
		return 'none';
	});

	// Path calculation based on edge type
	let path = $derived.by(() => {
		const fullPoints = [sourcePoint, ...(edge.waypoints || []), targetPoint];
		const rType = edge.type === 'default' ? 'bezier' : (edge.type || 'bezier');
		return getPathByRouting(rType as RoutingType, fullPoints);
	});

	let segments = $derived.by(() => {
		if (!isSelected) return [];
		const fullPoints = [sourcePoint, ...(edge.waypoints || []), targetPoint];
		const segs = [];
		for (let i = 0; i < fullPoints.length - 1; i++) {
			segs.push({
				x: (fullPoints[i].x + fullPoints[i+1].x) / 2,
				y: (fullPoints[i].y + fullPoints[i+1].y) / 2,
				index: i
			});
		}
		return segs;
	});

	let draggingWaypointIndex: number | null = null;

	function handleWaypointMouseDown(e: MouseEvent, index: number) {
		e.stopPropagation();
		e.preventDefault();
		draggingWaypointIndex = index;
		window.addEventListener('mousemove', handleWaypointMouseMove);
		window.addEventListener('mouseup', handleWaypointMouseUp);
	}

	function handleSegmentMouseDown(e: MouseEvent, insertIndex: number) {
		e.stopPropagation();
		e.preventDefault();
		const scale = $canvasStore.k;
		const x = (e.clientX - $canvasStore.x) / scale;
		const y = (e.clientY - $canvasStore.y) / scale;

		const newWaypoints = [...(edge.waypoints || [])];
		newWaypoints.splice(insertIndex, 0, { x, y });
		documentStore.updateEdge(edge.id, { waypoints: newWaypoints });

		draggingWaypointIndex = insertIndex;
		window.addEventListener('mousemove', handleWaypointMouseMove);
		window.addEventListener('mouseup', handleWaypointMouseUp);
	}

	function handleWaypointMouseMove(e: MouseEvent) {
		if (draggingWaypointIndex === null) return;
		const scale = $canvasStore.k;
		const x = (e.clientX - $canvasStore.x) / scale;
		const y = (e.clientY - $canvasStore.y) / scale;
		
		const newWaypoints = [...(edge.waypoints || [])];
		newWaypoints[draggingWaypointIndex] = { x, y };
		documentStore.updateEdge(edge.id, { waypoints: newWaypoints });
	}

	function handleWaypointMouseUp() {
		draggingWaypointIndex = null;
		window.removeEventListener('mousemove', handleWaypointMouseMove);
		window.removeEventListener('mouseup', handleWaypointMouseUp);
	}

	let isEditing = $state(false);

	// Calculate midpoint for label placement
	let midPoint = $derived.by(() => {
		if (edge.type === 'step') {
			const midX = (sourcePoint.x + targetPoint.x) / 2;
			return { x: midX, y: (sourcePoint.y + targetPoint.y) / 2 };
		} else {
			return {
				x: (sourcePoint.x + targetPoint.x) / 2,
				y: (sourcePoint.y + targetPoint.y) / 2
			};
		}
	});

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (e.shiftKey) {
			selectionStore.selectEdge(edge.id, true);
		} else {
			selectionStore.selectEdge(edge.id, false);
		}
	}

	function handleDblClick(e: MouseEvent) {
		e.stopPropagation();
		isEditing = true;
	}

	function handleBlur() {
		isEditing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			isEditing = false;
		}
	}

	function updateLabel(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		documentStore.updateEdge(edge.id, { label: val });
	}

	// Marker logic
	let markerEnd = $derived(
		edge.markerEnd === 'none'
			? undefined
			: edge.markerEnd
				? `url(#marker-${edge.markerEnd})`
				: 'url(#arrowhead)'
	);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g class="group" onclick={handleClick} ondblclick={handleDblClick} role="button" tabindex="0">
	<!-- Invisible thick path for easier selection -->
	<path d={path} stroke="transparent" stroke-width="20" fill="none" class="cursor-pointer" />

	<!-- Visible path -->
	<path
		d={path}
		stroke={strokeColor}
		stroke-width={strokeWidth}
		stroke-dasharray={strokeDasharray}
		fill="none"
		marker-end={markerEnd}
		class="transition-colors group-hover:stroke-indigo-400 {edge.animated
			? 'animate-[dash_1s_linear_infinite]'
			: ''}"
	/>

	<!-- Label -->
	{#if isEditing}
		<foreignObject x={midPoint.x - 40} y={midPoint.y - 15} width="80" height="30">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				value={edge.label || ''}
				oninput={updateLabel}
				onblur={handleBlur}
				onkeydown={handleKeydown}
				class="h-full w-full rounded border border-indigo-500 bg-slate-800 text-center text-xs text-white focus:outline-none"
				autofocus
			/>
		</foreignObject>
	{:else if edge.label}
		<rect
			x={midPoint.x - edge.label.length * 4 - 4}
			y={midPoint.y - 10}
			width={edge.label.length * 8 + 8}
			height="20"
			rx="4"
			fill="#0f172a"
			class="stroke-slate-700"
		/>
		<text
			x={midPoint.x}
			y={midPoint.y}
			dy="4"
			text-anchor="middle"
			class="pointer-events-none fill-slate-300 text-[10px] select-none"
		>
			{edge.label}
		</text>
	{/if}

	<!-- Waypoints and Segments for Selected Edge -->
	{#if isSelected}
		<!-- Midpoint handles to add waypoints -->
		{#each segments as seg}
			<circle
				cx={seg.x}
				cy={seg.y}
				r="4"
				class="cursor-crosshair fill-indigo-300 stroke-indigo-500 stroke-1 opacity-0 hover:opacity-100 transition-opacity"
				onmousedown={(e) => handleSegmentMouseDown(e, seg.index)}
			/>
		{/each}

		<!-- Draggable waypoints -->
		{#if edge.waypoints}
			{#each edge.waypoints as wp, i}
				<circle
					cx={wp.x}
					cy={wp.y}
					r="5"
					class="cursor-move fill-indigo-500 stroke-white stroke-2 hover:scale-125 transition-transform"
					onmousedown={(e) => handleWaypointMouseDown(e, i)}
					ondblclick={(e) => {
						// double click to remove waypoint
						e.stopPropagation();
						const newWaypoints = [...(edge.waypoints || [])];
						newWaypoints.splice(i, 1);
						documentStore.updateEdge(edge.id, { waypoints: newWaypoints });
					}}
				/>
			{/each}
		{/if}
	{/if}
</g>

<defs>
	<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
		<polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
	</marker>
</defs>

<style>
	@keyframes dash {
		to {
			stroke-dashoffset: -20;
		}
	}
</style>
