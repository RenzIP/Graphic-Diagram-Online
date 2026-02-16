<script lang="ts">
	import { documentStore, type Node } from '$lib/stores/document';
	import { selectionStore } from '$lib/stores/selection';
	import { canvasStore } from '$lib/stores/canvas';

	import { type Snippet } from 'svelte';

	let {
		node,
		children
	}: {
		node: Node;
		children?: Snippet;
	} = $props();

	let isDragging = $state(false);
	let startPos = { x: 0, y: 0 };
	let startNodePos = { x: 0, y: 0 };

	// Resize state
	let isResizing = $state(false);
	let resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | null = null;
	let startSize = { width: 0, height: 0 };

	// Edit state
	let isEditing = $state(false);
	let inputRef: HTMLTextAreaElement | undefined = $state();

	// Derived state
	let isSelected = $derived($selectionStore.nodes.includes(node.id));

	function handleMouseDown(event: MouseEvent) {
		event.stopPropagation(); // Prevent canvas pan

		// Selection logic
		if (!isSelected && !event.shiftKey) {
			selectionStore.selectNode(node.id, false);
		} else if (event.shiftKey) {
			selectionStore.selectNode(node.id, true);
		}

		if (event.button === 0) {
			isDragging = true;
			startPos = { x: event.clientX, y: event.clientY };
			startNodePos = { ...node.position };
		}
	}

	function handleResizeMouseDown(event: MouseEvent, handle: 'nw' | 'ne' | 'sw' | 'se') {
		event.stopPropagation();
		event.preventDefault();
		isResizing = true;
		resizeHandle = handle;
		startPos = { x: event.clientX, y: event.clientY };
		startNodePos = { ...node.position };
		startSize = { width: node.width || 120, height: node.height || 60 };
	}

	function handleMouseMove(event: MouseEvent) {
		const scale = $canvasStore.k;
		const dx = (event.clientX - startPos.x) / scale;
		const dy = (event.clientY - startPos.y) / scale;

		if (isResizing && resizeHandle) {
			let newX = startNodePos.x;
			let newY = startNodePos.y;
			let newWidth = startSize.width;
			let newHeight = startSize.height;

			if (resizeHandle.includes('e')) newWidth = Math.max(50, startSize.width + dx);
			if (resizeHandle.includes('w')) {
				newWidth = Math.max(50, startSize.width - dx);
				newX = startNodePos.x + dx;
			}
			if (resizeHandle.includes('s')) newHeight = Math.max(30, startSize.height + dy);
			if (resizeHandle.includes('n')) {
				newHeight = Math.max(30, startSize.height - dy);
				newY = startNodePos.y + dy;
			}

			// Adjust position if resizing from left/top to keep right/bottom fixed
			if (resizeHandle.includes('w')) newX = startNodePos.x + (startSize.width - newWidth);
			if (resizeHandle.includes('n')) newY = startNodePos.y + (startSize.height - newHeight);

			documentStore.updateNode(node.id, {
				position: { x: newX, y: newY },
				width: newWidth,
				height: newHeight
			});
			return;
		}

		if (!isDragging) return;

		documentStore.updateNode(node.id, {
			position: {
				x: startNodePos.x + dx,
				y: startNodePos.y + dy
			}
		});
	}

	function handleMouseUp() {
		isDragging = false;
		isResizing = false;
		resizeHandle = null;
	}

	// Connector drag state
	function handleConnectorMouseDown(
		event: MouseEvent,
		handle: 'top' | 'right' | 'bottom' | 'left'
	) {
		event.stopPropagation();
		event.preventDefault();
		const scale = $canvasStore.k;
		// Calculate center of the connector
		const bounds = (event.target as HTMLElement).getBoundingClientRect();
		// Convert screen to canvas coords
		const x = (bounds.left + bounds.width / 2 - $canvasStore.x) / scale;
		const y = (bounds.top + bounds.height / 2 - $canvasStore.y) / scale;

		canvasStore.startConnection(node.id, handle, { x, y });
	}

	function handleDblClick(e: MouseEvent) {
		e.stopPropagation();
		isEditing = true;
	}

	function handleEditBlur() {
		isEditing = false;
	}

	function handleEditKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			isEditing = false;
		}
	}

	function updateLabel(e: Event) {
		const val = (e.target as HTMLTextAreaElement).value;
		documentStore.updateNode(node.id, { label: val });
	}

	/* Toolbar removed - moved to FloatingToolbar.svelte */
	function updateColor(color: string) {
		// Driven by FloatingToolbar, but keeping for potential future single-node actions
		documentStore.updateNode(node.id, { color });
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<g
	transform="translate({node.position.x} {node.position.y})"
	onmousedown={handleMouseDown}
	ondblclick={handleDblClick}
	class="group cursor-move outline-none"
	role="group"
	aria-label="Node"
	onmouseenter={() => {
		if ($canvasStore.connecting && $canvasStore.connecting.sourceNodeId !== node.id) {
			canvasStore.updateConnection($canvasStore.connecting.mousePos, node.id);
		}
	}}
	onmouseleave={() => {
		if ($canvasStore.connecting && $canvasStore.connecting.candidateNodeId === node.id) {
			canvasStore.updateConnection($canvasStore.connecting.mousePos, undefined);
		}
	}}
	onmouseup={(e) => {
		if ($canvasStore.connecting && $canvasStore.connecting.sourceNodeId !== node.id) {
			e.stopPropagation();
			const { sourceNodeId, sourceHandle } = $canvasStore.connecting;

			// Create edge
			documentStore.addEdge({
				id: crypto.randomUUID(),
				source: sourceNodeId,
				target: node.id,
				type: 'default'
			});

			canvasStore.endConnection();
		}
	}}
>
	<!-- Selection Toolbar removed - moved to FloatingToolbar.svelte -->

	<!-- Selection Glow/Border -->
	{#if isSelected || $canvasStore.connecting?.candidateNodeId === node.id}
		<rect
			x={-4}
			y={-4}
			width={(node.width || 120) + 8}
			height={(node.height || 60) + 8}
			rx="8"
			class="fill-indigo-500/20 stroke-indigo-500 stroke-2 transition-all duration-150"
		/>

		{#if isSelected}
			<!-- Resize Handles -->
			<!-- NW -->
			<rect
				x={-8}
				y={-8}
				width={8}
				height={8}
				class="pointer-events-auto cursor-nw-resize fill-indigo-500 stroke-white stroke-1"
				onmousedown={(e) => handleResizeMouseDown(e, 'nw')}
			/>
			<!-- NE -->
			<rect
				x={node.width || 120}
				y={-8}
				width={8}
				height={8}
				class="pointer-events-auto cursor-ne-resize fill-indigo-500 stroke-white stroke-1"
				onmousedown={(e) => handleResizeMouseDown(e, 'ne')}
			/>
			<!-- SW -->
			<rect
				x={-8}
				y={node.height || 60}
				width={8}
				height={8}
				class="pointer-events-auto cursor-sw-resize fill-indigo-500 stroke-white stroke-1"
				onmousedown={(e) => handleResizeMouseDown(e, 'sw')}
			/>
			<!-- SE -->
			<rect
				x={node.width || 120}
				y={node.height || 60}
				width={8}
				height={8}
				class="pointer-events-auto cursor-se-resize fill-indigo-500 stroke-white stroke-1"
				onmousedown={(e) => handleResizeMouseDown(e, 'se')}
			/>
		{/if}
	{/if}

	{@render children?.()}

	{#if isEditing}
		<foreignObject x={0} y={0} width={node.width || 120} height={node.height || 60}>
			<!-- svelte-ignore a11y_autofocus -->
			<textarea
				bind:this={inputRef}
				value={node.label}
				oninput={updateLabel}
				onblur={handleEditBlur}
				onkeydown={handleEditKeydown}
				class="h-full w-full resize-none rounded border-2 border-indigo-500 bg-slate-800 p-2 text-center text-sm text-white focus:outline-none"
				autofocus
			></textarea>
		</foreignObject>
	{/if}

	<!-- Connectors (Only visible on hover or selection) -->
	<foreignObject
		x={-6}
		y={-6}
		width={(node.width || 120) + 12}
		height={(node.height || 60) + 12}
		class="pointer-events-none overflow-visible"
	>
		<div
			class="relative h-full w-full opacity-0 transition-opacity group-hover:opacity-100 {isSelected
				? 'opacity-100'
				: ''}"
		>
			<!-- Top -->
			<div
				class="pointer-events-auto absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125"
				onmousedown={(e) => handleConnectorMouseDown(e, 'top')}
				role="button"
				tabindex="0"
				aria-label="Connect Top"
			></div>
			<!-- Right -->
			<div
				class="pointer-events-auto absolute top-1/2 -right-1 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125"
				onmousedown={(e) => handleConnectorMouseDown(e, 'right')}
				role="button"
				tabindex="0"
				aria-label="Connect Right"
			></div>
			<!-- Bottom -->
			<div
				class="pointer-events-auto absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125"
				onmousedown={(e) => handleConnectorMouseDown(e, 'bottom')}
				role="button"
				tabindex="0"
				aria-label="Connect Bottom"
			></div>
			<!-- Left -->
			<div
				class="pointer-events-auto absolute top-1/2 -left-1 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125"
				onmousedown={(e) => handleConnectorMouseDown(e, 'left')}
				role="button"
				tabindex="0"
				aria-label="Connect Left"
			></div>
		</div>
	</foreignObject>
</g>
