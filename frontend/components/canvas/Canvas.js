'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../hooks/useStore.js';
import { canvasStore } from '../../lib/stores/canvas.js';
import { documentStore } from '../../lib/stores/document.js';
import { selectionStore } from '../../lib/stores/selection.js';
import { getSmoothPath } from '../../lib/utils/geometry.js';
import Grid from './Grid';

export default function Canvas({ children, onSvgRef }) {
	const svgRef = useRef(null);
	const canvas = useStore(canvasStore);
	const document = useStore(documentStore);
	const [isPanning, setIsPanning] = useState(false);
	const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
	const [selectionBox, setSelectionBox] = useState({ start: { x: 0, y: 0 }, current: { x: 0, y: 0 }, active: false });

	useEffect(() => {
		onSvgRef?.(svgRef.current);
	}, [onSvgRef]);

	useEffect(() => {
		function onMove(event) {
			if (selectionBox.active) {
				setSelectionBox((box) => ({ ...box, current: { x: (event.clientX - canvas.x) / canvas.k, y: (event.clientY - canvas.y) / canvas.k } }));
				return;
			}
			if (isPanning) {
				const dx = event.clientX - lastMousePos.x;
				const dy = event.clientY - lastMousePos.y;
				canvasStore.pan(dx, dy);
				setLastMousePos({ x: event.clientX, y: event.clientY });
			}
			if (canvas.connecting) {
				canvasStore.updateConnection({ x: (event.clientX - canvas.x) / canvas.k, y: (event.clientY - canvas.y) / canvas.k });
			}
		}
		function onUp(event) {
			if (selectionBox.active) {
				const x = Math.min(selectionBox.start.x, selectionBox.current.x);
				const y = Math.min(selectionBox.start.y, selectionBox.current.y);
				const w = Math.abs(selectionBox.current.x - selectionBox.start.x);
				const h = Math.abs(selectionBox.current.y - selectionBox.start.y);
				if (w < 2 && h < 2) {
					if (!event.shiftKey) selectionStore.clear();
				} else {
					const ids = document.nodes.filter((n) => n.position.x < x + w && n.position.x + (n.width || 120) > x && n.position.y < y + h && n.position.y + (n.height || 60) > y).map((n) => n.id);
					selectionStore.selectNodes(ids, event.shiftKey);
				}
				setSelectionBox((box) => ({ ...box, active: false }));
			}
			setIsPanning(false);
			if (canvas.connecting) canvasStore.endConnection();
		}
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}, [canvas, document.nodes, isPanning, lastMousePos, selectionBox]);

	function handleWheel(event) {
		event.preventDefault();
		if (event.ctrlKey) {
			const rect = svgRef.current.getBoundingClientRect();
			const center = { x: event.clientX - rect.left, y: event.clientY - rect.top };
			const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
			canvasStore.update((t) => {
				const newK = Math.min(Math.max(t.k * zoomFactor, 0.1), 5);
				return { x: center.x - (center.x - t.x) * (newK / t.k), y: center.y - (center.y - t.y) * (newK / t.k), k: newK };
			});
		} else {
			canvasStore.pan(-event.deltaX, -event.deltaY);
		}
	}

	function handleMouseDown(event) {
		const target = event.target;
		if ((target.tagName === 'svg' || target.tagName === 'rect') && event.button === 0) {
			if (event.shiftKey) {
				const x = (event.clientX - canvas.x) / canvas.k;
				const y = (event.clientY - canvas.y) / canvas.k;
				setSelectionBox({ active: true, start: { x, y }, current: { x, y } });
				selectionStore.clear();
			} else {
				setIsPanning(true);
				setLastMousePos({ x: event.clientX, y: event.clientY });
			}
		} else if (event.button === 1) {
			setIsPanning(true);
			setLastMousePos({ x: event.clientX, y: event.clientY });
			event.preventDefault();
		}
	}

	const conn = canvas.connecting;
	const startNode = conn ? document.nodes.find((n) => n.id === conn.sourceNodeId) : null;
	const startPos = startNode && conn ? {
		x: startNode.position.x + (conn.sourceHandle === 'left' ? 0 : conn.sourceHandle === 'right' ? startNode.width || 120 : (startNode.width || 120) / 2),
		y: startNode.position.y + (conn.sourceHandle === 'top' ? 0 : conn.sourceHandle === 'bottom' ? startNode.height || 60 : (startNode.height || 60) / 2)
	} : null;
	const boxX = Math.min(selectionBox.start.x, selectionBox.current.x);
	const boxY = Math.min(selectionBox.start.y, selectionBox.current.y);
	const boxW = Math.abs(selectionBox.current.x - selectionBox.start.x);
	const boxH = Math.abs(selectionBox.current.y - selectionBox.start.y);

	return (
		<div className="relative h-full w-full overflow-hidden bg-slate-900">
			<svg ref={svgRef} className="block h-full w-full cursor-crosshair touch-none active:cursor-grabbing" role="application" aria-label="Diagram Canvas" onWheel={handleWheel} onMouseDown={handleMouseDown}>
				<Grid />
				<g transform={`translate(${canvas.x} ${canvas.y}) scale(${canvas.k})`}>
					{children}
					{conn && startPos ? <path d={getSmoothPath(startPos, conn.mousePos, conn.sourceHandle, 'top')} className="pointer-events-none stroke-indigo-500 stroke-2" strokeDasharray="5,5" fill="none" /> : null}
					{selectionBox.active ? <rect x={boxX} y={boxY} width={boxW} height={boxH} className="pointer-events-none fill-indigo-500/10 stroke-indigo-500 stroke-1" /> : null}
				</g>
			</svg>
			<div className="absolute right-4 bottom-4 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-300 shadow-lg">{Math.round(canvas.k * 100)}%</div>
		</div>
	);
}
