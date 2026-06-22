'use client';

import { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore.js';
import { documentStore } from '../../lib/stores/document.js';
import { parseDSL } from '../../lib/dsl/parser.js';
import { transformAST } from '../../lib/dsl/transformer.js';
import { serializeToText } from '../../lib/dsl/serializer.js';

export default function DslEditor({ diagramType = 'flowchart', title = 'Untitled', visible = false, onToggle }) {
	const document = useStore(documentStore);
	const [dslText, setDslText] = useState('');
	const [isUpdating, setIsUpdating] = useState(false);
	const [panelHeight, setPanelHeight] = useState(250);

	useEffect(() => {
		if (!isUpdating) setDslText(serializeToText(document, diagramType, title));
	}, [diagramType, document, isUpdating, title]);

	function applyDSL() {
		setIsUpdating(true);
		try {
			documentStore.set(transformAST(parseDSL(dslText)));
		} catch (e) {
			window.__gradiol_toast?.(`DSL parse error: ${e.message}`, 'error');
		}
		setIsUpdating(false);
	}

	function handleResizeStart(e) {
		e.preventDefault();
		const startY = e.clientY;
		const startHeight = panelHeight;
		function onMove(ev) {
			setPanelHeight(Math.max(120, Math.min(500, startHeight - (ev.clientY - startY))));
		}
		function onUp() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	if (!visible) return null;

	return (
		<div className="flex flex-col border-t border-slate-800 bg-slate-900" style={{ height: panelHeight }}>
			<div className="flex h-1.5 cursor-ns-resize items-center justify-center bg-slate-800 hover:bg-indigo-500/30" onMouseDown={handleResizeStart}><div className="h-0.5 w-8 rounded-full bg-slate-600"></div></div>
			<div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
				<div className="flex items-center gap-2"><span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">DSL Editor</span></div>
				<div className="flex items-center gap-2"><button className="rounded bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20" onClick={applyDSL}>Apply</button><button className="rounded p-1 text-slate-500 transition-colors hover:text-white" onClick={onToggle}>×</button></div>
			</div>
			<textarea value={dslText} onChange={(e) => setDslText(e.target.value)} className="flex-1 resize-none bg-slate-950 p-4 font-mono text-sm text-slate-300 placeholder-slate-600 focus:outline-none" placeholder={`@${diagramType} "${title}"\n\nstart "Begin"\nprocess "Step 1"\nend "Finish"\n\nstart -> "Step 1"\n"Step 1" -> end`} spellCheck="false" />
		</div>
	);
}
