<script lang="ts">
	import { documentStore } from '$lib/stores/document';
	import { canvasStore } from '$lib/stores/canvas';
	import { historyStore } from '$lib/stores/history';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import {
		exportPNG,
		exportSVG,
		exportJPG,
		exportWebP,
		exportJSON,
		exportDSL
	} from '$lib/utils/export';
	import { serializeToText } from '$lib/dsl/serializer';
	import { alignNodes, distributeNodes } from '$lib/utils/layout';
	import { selectionStore } from '$lib/stores/selection';
	import { get } from 'svelte/store';

	let {
		title = 'Untitled',
		diagramType = 'flowchart',
		onTitleChange,
		svgRef,
		isDirty = false,
		isSaving = false,
		lastSavedAt = null as string | null
	}: {
		title?: string;
		diagramType?: string;
		onTitleChange?: (title: string) => void;
		svgRef?: SVGSVGElement | null;
		isDirty?: boolean;
		isSaving?: boolean;
		lastSavedAt?: string | null;
	} = $props();

	let editingTitle = $state(false);
	let titleInput = $state('');
	let showExportModal = $state(false);
	let isExporting = $state(false);

	// Derived state for enabling tools
	let selection = $derived($selectionStore);
	let canAlign = $derived(selection.nodes.length >= 2);
	let canDistribute = $derived(selection.nodes.length >= 3);

	function handleUndo() {
		const state = historyStore.undo(get(documentStore));
		if (state) documentStore.set(state);
	}

	function handleRedo() {
		const state = historyStore.redo(get(documentStore));
		if (state) documentStore.set(state);
	}

	function handleSave() {
		// Save is now triggered externally via Ctrl+S or autosave
		// This dispatches a keyboard event to trigger the same path
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
	}

	function handleAlign(type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
		const currentNodes = get(documentStore).nodes.filter((n) => selection.nodes.includes(n.id));
		const aligned = alignNodes(currentNodes, type);
		aligned.forEach((n) => documentStore.updateNode(n.id, { position: n.position }));
	}

	function handleDistribute(type: 'horizontal' | 'vertical') {
		const currentNodes = get(documentStore).nodes.filter((n) => selection.nodes.includes(n.id));
		const distributed = distributeNodes(currentNodes, type);
		distributed.forEach((n) => documentStore.updateNode(n.id, { position: n.position }));
	}

	function handleTitleSave() {
		editingTitle = false;
		onTitleChange?.(titleInput);
	}

	function handleExport(format: string) {
		const state = get(documentStore);
		switch (format) {
			case 'png':
				if (svgRef) exportPNG(svgRef, state, `${titleInput}.png`);
				break;
			case 'jpg':
				if (svgRef) exportJPG(svgRef, state, `${titleInput}.jpg`);
				break;
			case 'webp':
				if (svgRef) exportWebP(svgRef, state, `${titleInput}.webp`);
				break;
			case 'svg':
				if (svgRef) exportSVG(svgRef, state, `${titleInput}.svg`);
				break;
			case 'json':
				exportJSON(state, `${titleInput}.json`);
				break;
			case 'dsl':
				const dsl = serializeToText(state, diagramType, titleInput);
				exportDSL(dsl, `${titleInput}.dsl`);
				break;
		}
		showExportModal = false;
	}

	function zoomIn() {
		canvasStore.setZoom(Math.min($canvasStore.k + 0.25, 4));
	}

	function zoomOut() {
		canvasStore.setZoom(Math.max($canvasStore.k - 0.25, 0.1));
	}

	function zoomReset() {
		canvasStore.setZoom(1);
	}

	let zoomPercent = $derived(Math.round($canvasStore.k * 100));
</script>

<div class="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
	<!-- Left: Logo + Title -->
	<div class="flex items-center gap-3">
		<a
			href="/dashboard"
			class="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
			aria-label="Back to Dashboard"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
		</a>
		<div class="h-5 w-px bg-slate-700"></div>

		{#if editingTitle}
			<input
				type="text"
				bind:value={titleInput}
				onblur={handleTitleSave}
				onkeydown={(e) => {
					if (e.key === 'Enter') handleTitleSave();
				}}
				class="rounded border border-indigo-500 bg-slate-800 px-2 py-0.5 text-sm text-white focus:outline-none"
				autofocus
			/>
		{:else}
			<button
				class="rounded px-2 py-0.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
				onclick={() => {
					editingTitle = true;
					titleInput = title;
				}}
			>
				{title}
			</button>
		{/if}

		<span class="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 capitalize"
			>{diagramType}</span
		>
		{#if isSaving}
			<span class="text-xs text-slate-500">Saving...</span>
		{:else if isDirty}
			<span class="text-xs text-amber-400" title="Unsaved changes">●</span>
		{:else if lastSavedAt}
			<span class="text-xs text-slate-600" title="Saved at {lastSavedAt}">✓</span>
		{/if}
	</div>

	<!-- Center: Actions -->
	<div class="flex items-center gap-1">
		<button
			class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
			onclick={handleUndo}
			disabled={!$historyStore.canUndo}
			aria-label="Undo"
			title="Undo (Ctrl+Z)"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
				/>
			</svg>
		</button>
		<button
			class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"
			onclick={handleRedo}
			disabled={!$historyStore.canRedo}
			aria-label="Redo"
			title="Redo (Ctrl+Shift+Z)"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
				/>
			</svg>
		</button>

		<div class="mx-1 h-5 w-px bg-slate-700"></div>

		<!-- Alignment Tools -->
		<div
			class="flex items-center gap-0.5"
			class:opacity-30={!canAlign}
			class:pointer-events-none={!canAlign}
		>
			<button
				class="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
				title="Align Left"
				onclick={() => handleAlign('left')}
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					><path d="M4 20V4M8 6h12M8 12h8M8 18h10"></path></svg
				>
			</button>
			<button
				class="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
				title="Align Center"
				onclick={() => handleAlign('center')}
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					><path d="M12 4v16M4 6h16M6 12h12M4 18h16"></path></svg
				>
			</button>
			<button
				class="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
				title="Align Right"
				onclick={() => handleAlign('right')}
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					><path d="M20 20V4M4 6h12M8 12h8M6 18h10"></path></svg
				>
			</button>
		</div>

		<div class="mx-1 h-5 w-px bg-slate-700"></div>

		<!-- Zoom -->
		<button
			class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
			onclick={zoomOut}
			aria-label="Zoom out"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
			</svg>
		</button>
		<button
			class="min-w-[48px] rounded px-1.5 py-0.5 text-xs text-slate-300 transition-colors hover:bg-slate-800"
			onclick={zoomReset}>{zoomPercent}%</button
		>
		<button
			class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
			onclick={zoomIn}
			aria-label="Zoom in"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	<!-- Right: Save + Export -->
	<div class="flex items-center gap-2">
		<button
			class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
			onclick={() => (showExportModal = true)}
			aria-label="Export"
			title="Export"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
		</button>

		<Button variant="primary" size="sm" onclick={handleSave} disabled={isSaving}>
			{isSaving ? 'Saving...' : 'Save'}
		</Button>
	</div>
</div>

<!-- Export Modal -->
<Modal open={showExportModal} title="Export Diagram" onclose={() => (showExportModal = false)}>
	<div class="grid grid-cols-2 gap-3">
		<button
			class="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800"
			onclick={() => handleExport('png')}
		>
			<svg class="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/></svg
			>
			<span class="text-sm font-medium text-white">PNG</span>
			<span class="text-xs text-slate-500">Raster image</span>
		</button>
		<button
			class="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800"
			onclick={() => handleExport('jpg')}
		>
			<svg class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/></svg
			>
			<span class="text-sm font-medium text-white">JPG</span>
			<span class="text-xs text-slate-500">Compact image</span>
		</button>
		<button
			class="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800"
			onclick={() => handleExport('webp')}
		>
			<svg class="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/></svg
			>
			<span class="text-sm font-medium text-white">WebP</span>
			<span class="text-xs text-slate-500">Modern format</span>
		</button>
		<button
			class="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800"
			onclick={() => handleExport('svg')}
		>
			<svg class="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M7 21H17M12 3v14m0 0l-4-4m4 4l4-4"
				/></svg
			>
			<span class="text-sm font-medium text-white">SVG</span>
			<span class="text-xs text-slate-500">Vector image</span>
		</button>
		<button
			class="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800"
			onclick={() => handleExport('json')}
		>
			<svg class="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
				/></svg
			>
			<span class="text-sm font-medium text-white">JSON</span>
			<span class="text-xs text-slate-500">Semantic model</span>
		</button>
		<button
			class="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800"
			onclick={() => handleExport('dsl')}
		>
			<svg class="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/></svg
			>
			<span class="text-sm font-medium text-white">DSL Text</span>
			<span class="text-xs text-slate-500">GraDiOl format</span>
		</button>
	</div>
</Modal>
