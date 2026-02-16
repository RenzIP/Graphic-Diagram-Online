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
			documentStore.set(newState);
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
	<div class="flex flex-col border-t border-slate-800 bg-slate-900" style="height: {panelHeight}px">
		<!-- Resize handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex h-1.5 cursor-ns-resize items-center justify-center bg-slate-800 hover:bg-indigo-500/30"
			onmousedown={handleResizeStart}
		>
			<div class="h-0.5 w-8 rounded-full bg-slate-600"></div>
		</div>

		<!-- Header -->
		<div class="flex items-center justify-between border-b border-slate-800 px-4 py-2">
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
				<span class="text-xs font-semibold tracking-wider text-slate-400 uppercase">DSL Editor</span
				>
			</div>
			<div class="flex items-center gap-2">
				<button
					class="rounded bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
					onclick={applyDSL}
				>
					Apply
				</button>
				<button
					class="rounded p-1 text-slate-500 transition-colors hover:text-white"
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
			class="flex-1 resize-none bg-slate-950 p-4 font-mono text-sm text-slate-300 placeholder-slate-600 focus:outline-none"
			placeholder={`@${diagramType} "${title}"\n\nstart "Begin"\nprocess "Step 1"\nend "Finish"\n\nstart -> "Step 1"\n"Step 1" -> end`}
			spellcheck="false"
		></textarea>
	</div>
{/if}
