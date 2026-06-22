'use client';

import { useState } from 'react';
import { useStore } from '../../hooks/useStore.js';
import Button from '../ui/Button.js';
import Modal from '../ui/Modal.js';
import { canvasStore } from '../../lib/stores/canvas.js';
import { documentStore } from '../../lib/stores/document.js';
import { historyStore } from '../../lib/stores/history.js';
import { selectionStore } from '../../lib/stores/selection.js';
import { exportDSL, exportJPG, exportJSON, exportPNG, exportSVG, exportWebP } from '../../lib/utils/export.js';
import { serializeToText } from '../../lib/dsl/serializer.js';
import { alignNodes, distributeNodes } from '../../lib/utils/layout.js';

export default function Toolbar({ title = 'Untitled', diagramType = 'flowchart', onTitleChange, svgRef, isDirty = false, isSaving = false, lastSavedAt = null }) {
	const canvas = useStore(canvasStore);
	const history = useStore(historyStore);
	const selection = useStore(selectionStore);
	const [editingTitle, setEditingTitle] = useState(false);
	const [titleInput, setTitleInput] = useState(title);
	const [showExportModal, setShowExportModal] = useState(false);
	const canAlign = selection.nodes.length >= 2;

	function handleUndo() {
		const state = historyStore.undo(documentStore.get());
		if (state) documentStore.set(state);
	}
	function handleRedo() {
		const state = historyStore.redo(documentStore.get());
		if (state) documentStore.set(state);
	}
	function handleSave() {
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
	}
	function handleAlign(type) {
		const currentNodes = documentStore.get().nodes.filter((n) => selection.nodes.includes(n.id));
		alignNodes(currentNodes, type).forEach((n) => documentStore.updateNode(n.id, { position: n.position }));
	}
	function handleDistribute(type) {
		const currentNodes = documentStore.get().nodes.filter((n) => selection.nodes.includes(n.id));
		distributeNodes(currentNodes, type).forEach((n) => documentStore.updateNode(n.id, { position: n.position }));
	}
	function handleTitleSave() {
		setEditingTitle(false);
		onTitleChange?.(titleInput);
	}
	function handleExport(format) {
		const state = documentStore.get();
		const fileTitle = titleInput || title;
		if (format === 'png' && svgRef) exportPNG(svgRef, state, `${fileTitle}.png`);
		if (format === 'jpg' && svgRef) exportJPG(svgRef, state, `${fileTitle}.jpg`);
		if (format === 'webp' && svgRef) exportWebP(svgRef, state, `${fileTitle}.webp`);
		if (format === 'svg' && svgRef) exportSVG(svgRef, state, `${fileTitle}.svg`);
		if (format === 'json') exportJSON(state, `${fileTitle}.json`);
		if (format === 'dsl') exportDSL(serializeToText(state, diagramType, fileTitle), `${fileTitle}.dsl`);
		setShowExportModal(false);
	}

	return (
		<div className="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
			<div className="flex items-center gap-3">
				<a href="/dashboard" className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white" aria-label="Back to Dashboard">←</a>
				<div className="h-5 w-px bg-slate-700"></div>
				{editingTitle ? (
					<input type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onBlur={handleTitleSave} onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }} className="rounded border border-indigo-500 bg-slate-800 px-2 py-0.5 text-sm text-white focus:outline-none" autoFocus />
				) : (
					<button className="rounded px-2 py-0.5 text-sm font-medium text-white transition-colors hover:bg-slate-800" onClick={() => { setEditingTitle(true); setTitleInput(title); }}>{title}</button>
				)}
				<span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 capitalize">{diagramType}</span>
				{isSaving ? <span className="text-xs text-slate-500">Saving...</span> : isDirty ? <span className="text-xs text-amber-400" title="Unsaved changes">●</span> : lastSavedAt ? <span className="text-xs text-slate-600" title={`Saved at ${lastSavedAt}`}>✓</span> : null}
			</div>
			<div className="flex items-center gap-1">
				<button className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30" onClick={handleUndo} disabled={!history.canUndo} title="Undo (Ctrl+Z)">↶</button>
				<button className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30" onClick={handleRedo} disabled={!history.canRedo} title="Redo (Ctrl+Shift+Z)">↷</button>
				<div className="mx-1 h-5 w-px bg-slate-700"></div>
				<div className={`flex items-center gap-0.5 ${!canAlign ? 'pointer-events-none opacity-30' : ''}`}>
					<button className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" title="Align Left" onClick={() => handleAlign('left')}>L</button>
					<button className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" title="Align Center" onClick={() => handleAlign('center')}>C</button>
					<button className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" title="Align Right" onClick={() => handleAlign('right')}>R</button>
				</div>
				<div className="mx-1 h-5 w-px bg-slate-700"></div>
				<button className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white" onClick={() => canvasStore.setZoom(Math.max(canvas.k - 0.25, 0.1))}>−</button>
				<button className="min-w-[48px] rounded px-1.5 py-0.5 text-xs text-slate-300 transition-colors hover:bg-slate-800" onClick={() => canvasStore.setZoom(1)}>{Math.round(canvas.k * 100)}%</button>
				<button className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white" onClick={() => canvasStore.setZoom(Math.min(canvas.k + 0.25, 4))}>+</button>
			</div>
			<div className="flex items-center gap-2">
				<button className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white" onClick={() => setShowExportModal(true)} title="Export">⇩</button>
				<Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
			</div>
			<Modal open={showExportModal} title="Export Diagram" onClose={() => setShowExportModal(false)}>
				<div className="grid grid-cols-2 gap-3 p-6">
					{['png', 'jpg', 'webp', 'svg', 'json', 'dsl'].map((format) => (
						<button key={format} className="flex flex-col items-center gap-2 rounded-lg border border-slate-700 p-4 transition-colors hover:border-indigo-500 hover:bg-slate-800" onClick={() => handleExport(format)}>
							<span className="text-sm font-medium text-white">{format === 'dsl' ? 'DSL Text' : format.toUpperCase()}</span>
						</button>
					))}
				</div>
			</Modal>
		</div>
	);
}
