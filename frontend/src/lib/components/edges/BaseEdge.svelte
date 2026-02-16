<script lang="ts">
	import { getSmoothPath, getStraightPath, getOrthogonalPath } from '$lib/utils/geometry';
	import { documentStore, type Edge, type Node } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';

	let { edge, sourceNode, targetNode }: { edge: Edge; sourceNode: Node; targetNode: Node } =
		$props();

	// Simple center-to-center calculation for now
	// In a real app, calculate intersection with node boundary
	let sourceCenter = $derived({
		x: sourceNode.position.x + (sourceNode.width || 100) / 2,
		y: sourceNode.position.y + (sourceNode.height || 50) / 2
	});

	let targetCenter = $derived({
		x: targetNode.position.x + (targetNode.width || 100) / 2,
		y: targetNode.position.y + (targetNode.height || 50) / 2
	});

	let isSelected = $derived($selectionStore.edges.includes(edge.id));

	// Path calculation based on edge type
	let path = $derived.by(() => {
		switch (edge.type) {
			case 'step':
				return getOrthogonalPath(sourceCenter, targetCenter);
			case 'straight':
				return getStraightPath(sourceCenter, targetCenter);
			case 'default':
			default:
				return getSmoothPath(sourceCenter, targetCenter);
		}
	});

	let isEditing = $state(false);
	let inputRef: HTMLInputElement;

	// Calculate midpoint for label placement
	let midPoint = $derived.by(() => {
		// Approximate midpoint based on edge type
		if (edge.type === 'step') {
			const midX = (sourceCenter.x + targetCenter.x) / 2;
			return { x: midX, y: (sourceCenter.y + targetCenter.y) / 2 };
		} else {
			// For bezier/straight, simple average is okay approximation for now
			return {
				x: (sourceCenter.x + targetCenter.x) / 2,
				y: (sourceCenter.y + targetCenter.y) / 2
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
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<g class="group" onclick={handleClick} ondblclick={handleDblClick} role="button" tabindex="0">
	<!-- Invisible thick path for easier selection -->
	<path d={path} stroke="transparent" stroke-width="20" fill="none" class="cursor-pointer" />

	<!-- Visible path -->
	<path
		d={path}
		stroke={isSelected ? '#6366f1' : '#64748b'}
		stroke-width={isSelected ? 3 : 2}
		fill="none"
		marker-end="url(#arrowhead)"
		class="transition-colors group-hover:stroke-indigo-400"
	/>

	<!-- Label -->
	{#if isEditing}
		<foreignObject x={midPoint.x - 40} y={midPoint.y - 15} width="80" height="30">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:this={inputRef}
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
</g>

<defs>
	<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
		<polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
	</marker>
</defs>
