<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { parseDSL } from '$lib/dsl/parser';
	import { transformAST } from '$lib/dsl/transformer';
	import { serializeToText } from '$lib/dsl/serializer';
	import { get } from 'svelte/store';

	let {
		diagramType = 'flowchart',
		title = 'Untitled',
		visible = false,
		onToggle
	}: {
		diagramType?: string;
		title?: string;
		visible?: boolean;
		onToggle?: () => void;
	} = $props();

	let dslText = $state('');
	let isUpdating = false;
	let panelHeight = $state(250);
	let isResizing = $state(false);

	// Sync: diagram → text (when document changes)
	$effect(() => {
		if (isUpdating) return;
		const state = $documentStore;
		dslText = serializeToText(state, diagramType, title);
	});

	// Apply DSL text to diagram
	function applyDSL() {
		isUpdating = true;
		try {
			const ast = parseDSL(dslText);
			const newState = transformAST(ast);
			
			const currentState = get(documentStore);
			
			// Smart Merge Nodes
			const mergedNodes = newState.nodes.map(newNode => {
				const existingNode = currentState.nodes.find(n => n.id === newNode.id || n.label === newNode.label);
				if (existingNode) {
					return {
						...newNode,
						id: existingNode.id, // Preserve ID if matched by label
						position: existingNode.position,
						width: existingNode.width,
						height: existingNode.height,
						rotation: existingNode.rotation,
						style: existingNode.style,
						locked: existingNode.locked
					};
				}
				return newNode; // New node
			});

			// Smart Merge Edges
			const mergedEdges = newState.edges.map(newEdge => {
				// Match by ID or by Source+Target connection
				const sourceNode = mergedNodes.find(n => n.id === newEdge.source || n.label === newEdge.source);
				const targetNode = mergedNodes.find(n => n.id === newEdge.target || n.label === newEdge.target);
				
				const sourceId = sourceNode ? sourceNode.id : newEdge.source;
				const targetId = targetNode ? targetNode.id : newEdge.target;

				const existingEdge = currentState.edges.find(e => 
					e.id === newEdge.id || 
					(e.source === sourceId && e.target === targetId)
				);

				if (existingEdge) {
					return {
						...newEdge,
						id: existingEdge.id,
						source: sourceId,
						target: targetId,
						waypoints: existingEdge.waypoints,
						style: existingEdge.style,
						type: existingEdge.type,
						animated: existingEdge.animated,
						markerStart: existingEdge.markerStart,
						markerEnd: existingEdge.markerEnd
					};
				}
				return { ...newEdge, source: sourceId, target: targetId };
			});

			documentStore.set({ nodes: mergedNodes, edges: mergedEdges });
		} catch (e) {
			// Show error toast
			if (typeof window !== 'undefined' && (window as any).__gradiol_toast) {
				(window as any).__gradiol_toast('DSL parse error: ' + (e as Error).message, 'error');
			}
		}
		isUpdating = false;
	}

	// Resize handle
	function handleResizeStart(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;
		const startY = e.clientY;
		const startHeight = panelHeight;

		function onMove(ev: MouseEvent) {
			panelHeight = Math.max(120, Math.min(500, startHeight - (ev.clientY - startY)));
		}
		function onUp() {
			isResizing = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}
</script>

{#if visible}
	<div class="flex flex-col border-t border-white/5 bg-surface/90 backdrop-blur-xl" style="height: {panelHeight}px">
		<!-- Resize handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex h-1.5 cursor-ns-resize items-center justify-center bg-background/50 hover:bg-primary/30 transition-colors"
			onmousedown={handleResizeStart}
		>
			<div class="h-0.5 w-8 rounded-full bg-white/20"></div>
		</div>

		<!-- Header -->
		<div class="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-surface/50">
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4 text-[#06b6d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
				<span class="text-[11px] font-bold tracking-wider text-text-tertiary uppercase font-outfit">DSL Editor</span
				>
			</div>
			<div class="flex items-center gap-2">
				<button
					class="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
					onclick={applyDSL}
				>
					Apply
				</button>
				<button
					class="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-white/5 hover:text-white"
					onclick={onToggle}
					aria-label="Close DSL Editor"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Editor -->
		<textarea
			bind:value={dslText}
			class="flex-1 resize-none bg-background p-4 font-mono text-[13px] text-text-primary placeholder-text-tertiary focus:outline-none"
			placeholder={`@${diagramType} "${title}"\n\nstart "Begin"\nprocess "Step 1"\nend "Finish"\n\nstart -> "Step 1"\n"Step 1" -> end`}
			spellcheck="false"
		></textarea>
	</div>
{/if}
