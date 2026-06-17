'use client';

import { useEffect, useState } from 'react';
import { useStore } from '../../hooks/useStore.js';
import { canvasStore } from '../../lib/stores/canvas.js';
import { documentStore } from '../../lib/stores/document.js';
import { selectionStore } from '../../lib/stores/selection.js';

export default function NodeWrapper({ node, children }) {
	const canvas = useStore(canvasStore);
	const selection = useStore(selectionStore);
	const isSelected = selection.nodes.includes(node.id);
	const [drag, setDrag] = useState(null);
	const [resize, setResize] = useState(null);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		function onMove(event) {
			if (resize) {
				const dx = (event.clientX - resize.start.x) / canvas.k;
				const dy = (event.clientY - resize.start.y) / canvas.k;
				let newX = resize.nodePos.x;
				let newY = resize.nodePos.y;
				let newWidth = resize.size.width;
				let newHeight = resize.size.height;
				if (resize.handle.includes('e')) newWidth = Math.max(50, resize.size.width + dx);
				if (resize.handle.includes('w')) {
					newWidth = Math.max(50, resize.size.width - dx);
					newX = resize.nodePos.x + (resize.size.width - newWidth);
				}
				if (resize.handle.includes('s')) newHeight = Math.max(30, resize.size.height + dy);
				if (resize.handle.includes('n')) {
					newHeight = Math.max(30, resize.size.height - dy);
					newY = resize.nodePos.y + (resize.size.height - newHeight);
				}
				documentStore.updateNode(node.id, { position: { x: newX, y: newY }, width: newWidth, height: newHeight });
				return;
			}
			if (!drag) return;
			const dx = (event.clientX - drag.start.x) / canvas.k;
			const dy = (event.clientY - drag.start.y) / canvas.k;
			documentStore.updateNode(node.id, { position: { x: drag.nodePos.x + dx, y: drag.nodePos.y + dy } });
		}
		function onUp() {
			setDrag(null);
			setResize(null);
		}
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}, [canvas.k, drag, resize, node.id]);

	function handleMouseDown(event) {
		event.stopPropagation();
		if (!isSelected && !event.shiftKey) selectionStore.selectNode(node.id, false);
		else if (event.shiftKey) selectionStore.selectNode(node.id, true);
		if (event.button === 0 && !node.locked) setDrag({ start: { x: event.clientX, y: event.clientY }, nodePos: { ...node.position } });
	}

	function handleConnectorMouseDown(event, handle) {
		event.stopPropagation();
		event.preventDefault();
		const bounds = event.currentTarget.getBoundingClientRect();
		const x = (bounds.left + bounds.width / 2 - canvas.x) / canvas.k;
		const y = (bounds.top + bounds.height / 2 - canvas.y) / canvas.k;
		canvasStore.startConnection(node.id, handle, { x, y });
	}

	const selectedOrTarget = isSelected || canvas.connecting?.candidateNodeId === node.id;

	return (
		<g
			transform={`translate(${node.position.x} ${node.position.y})`}
			onMouseDown={handleMouseDown}
			onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
			onMouseEnter={() => {
				if (canvas.connecting && canvas.connecting.sourceNodeId !== node.id) canvasStore.updateConnection(canvas.connecting.mousePos, node.id);
			}}
			onMouseLeave={() => {
				if (canvas.connecting?.candidateNodeId === node.id) canvasStore.updateConnection(canvas.connecting.mousePos, undefined);
			}}
			onMouseUp={(e) => {
				if (canvas.connecting && canvas.connecting.sourceNodeId !== node.id) {
					e.stopPropagation();
					if (canvas.connecting.modifyingEdgeId) {
						documentStore.updateEdge(canvas.connecting.modifyingEdgeId, canvas.connecting.isReversed ? { source: node.id } : { target: node.id });
					} else {
						documentStore.addEdge({ id: crypto.randomUUID(), source: canvas.connecting.sourceNodeId, target: node.id, type: 'straight' });
					}
					canvasStore.endConnection();
				}
			}}
			className="group cursor-move outline-none"
			role="group"
			aria-label="Node"
		>
			{selectedOrTarget ? (
				<>
					<rect x={-4} y={-4} width={(node.width || 120) + 8} height={(node.height || 60) + 8} rx="8" className="fill-indigo-500/20 stroke-indigo-500 stroke-2 transition-all duration-150" />
					{isSelected ? ['nw', 'ne', 'sw', 'se'].map((handle) => {
						const x = handle.includes('w') ? -8 : node.width || 120;
						const y = handle.includes('n') ? -8 : node.height || 60;
						return <rect key={handle} x={x} y={y} width={8} height={8} className={`pointer-events-auto cursor-${handle}-resize fill-indigo-500 stroke-white stroke-1`} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setResize({ handle, start: { x: e.clientX, y: e.clientY }, nodePos: { ...node.position }, size: { width: node.width || 120, height: node.height || 60 } }); }} />;
					}) : null}
				</>
			) : null}
			{children}
			{isEditing ? (
				<foreignObject x={0} y={0} width={node.width || 120} height={node.height || 60}>
					<textarea autoFocus value={node.label || ''} onChange={(e) => documentStore.updateNode(node.id, { label: e.target.value })} onBlur={() => setIsEditing(false)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setIsEditing(false); } }} className="h-full w-full resize-none rounded border-2 border-indigo-500 bg-slate-800 p-2 text-center text-sm text-white focus:outline-none" />
				</foreignObject>
			) : null}
			<foreignObject x={-6} y={-6} width={(node.width || 120) + 12} height={(node.height || 60) + 12} className="pointer-events-none overflow-visible">
				<div className={`relative h-full w-full opacity-0 transition-opacity group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}>
					{[
						['top', '-top-1 left-1/2 -translate-x-1/2'],
						['right', 'top-1/2 -right-1 -translate-y-1/2'],
						['bottom', '-bottom-1 left-1/2 -translate-x-1/2'],
						['left', 'top-1/2 -left-1 -translate-y-1/2']
					].map(([handle, pos]) => (
						<div key={handle} className={`pointer-events-auto absolute h-3 w-3 cursor-crosshair rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125 ${pos}`} onMouseDown={(e) => handleConnectorMouseDown(e, handle)} role="button" tabIndex={0} aria-label={`Connect ${handle}`} />
					))}
				</div>
			</foreignObject>
		</g>
	);
}
