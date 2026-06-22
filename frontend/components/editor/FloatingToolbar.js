'use client';

import { useStore } from '../../hooks/useStore.js';
import { documentStore } from '../../lib/stores/document.js';
import { selectionStore } from '../../lib/stores/selection.js';

const colors = ['slate', 'red', 'green', 'amber', 'indigo', 'cyan', 'white'];

export default function FloatingToolbar() {
	const selection = useStore(selectionStore);
	const document = useStore(documentStore);
	if (selection.nodes.length === 0) return null;
	const nodes = document.nodes.filter((node) => selection.nodes.includes(node.id));
	if (nodes.length === 0) return null;

	function updateColor(color) {
		selection.nodes.forEach((id) => documentStore.updateNode(id, { color }));
	}
	function duplicateNodes() {
		nodes.forEach((node) => documentStore.addNode({ ...node, id: crypto.randomUUID(), position: { x: node.position.x + 20, y: node.position.y + 20 } }));
	}
	function deleteNodes() {
		selection.nodes.forEach((id) => documentStore.removeNode(id));
		selectionStore.clear();
	}

	return (
		<div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur">
			{colors.map((color) => <button key={color} className={`h-5 w-5 rounded-full border border-white/20 bg-${color}-500`} onClick={() => updateColor(color)} title={color}></button>)}
			<div className="h-5 w-px bg-slate-700"></div>
			<button className="text-xs text-slate-300 hover:text-white" onClick={duplicateNodes}>Duplicate</button>
			<button className="text-xs text-red-400 hover:text-red-200" onClick={deleteNodes}>Delete</button>
		</div>
	);
}
