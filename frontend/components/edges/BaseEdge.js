'use client';

import { useState } from 'react';
import { getOrthogonalPath, getSmoothPath, getSmoothPolyline, getStraightPath } from '../../lib/utils/geometry.js';
import { documentStore } from '../../lib/stores/document.js';
import { selectionStore } from '../../lib/stores/selection.js';
import { useStore } from '../../hooks/useStore.js';

export default function BaseEdge({ edge, sourceNode, targetNode }) {
	const selection = useStore(selectionStore);
	const [isEditing, setIsEditing] = useState(false);
	const sourceCenter = { x: sourceNode.position.x + (sourceNode.width || 100) / 2, y: sourceNode.position.y + (sourceNode.height || 50) / 2 };
	const targetCenter = { x: targetNode.position.x + (targetNode.width || 100) / 2, y: targetNode.position.y + (targetNode.height || 50) / 2 };
	const isSelected = selection.edges.includes(edge.id);
	const strokeColor = isSelected ? '#6366f1' : edge.style?.stroke || '#64748b';
	const strokeWidth = (edge.style?.strokeWidth || 2) + (isSelected ? 1 : 0);
	const strokeDasharray = edge.style?.strokeDasharray || (edge.animated ? '5,5' : 'none');
	const path = edge.waypoints?.length
		? edge.type === 'straight'
			? [`M ${sourceCenter.x} ${sourceCenter.y}`, ...edge.waypoints.map((p) => `L ${p.x} ${p.y}`), `L ${targetCenter.x} ${targetCenter.y}`].join(' ')
			: getSmoothPolyline([sourceCenter, ...edge.waypoints, targetCenter])
		: edge.type === 'step'
			? getOrthogonalPath(sourceCenter, targetCenter)
			: edge.type === 'straight'
				? getStraightPath(sourceCenter, targetCenter)
				: getSmoothPath(sourceCenter, targetCenter);
	const midPoint = { x: (sourceCenter.x + targetCenter.x) / 2, y: (sourceCenter.y + targetCenter.y) / 2 };
	const markerEnd = edge.markerEnd === 'none' ? undefined : edge.markerEnd ? `url(#marker-${edge.markerEnd})` : 'url(#arrowhead)';

	function handleClick(e) {
		e.stopPropagation();
		selectionStore.selectEdge(edge.id, e.shiftKey);
	}

	return (
		<g className="group" onClick={handleClick} onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} role="button" tabIndex={0}>
			<path d={path} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
			<path d={path} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" markerEnd={markerEnd} className={`transition-colors group-hover:stroke-indigo-400 ${edge.animated ? 'animate-[dash_1s_linear_infinite]' : ''}`} />
			{isEditing ? (
				<foreignObject x={midPoint.x - 40} y={midPoint.y - 15} width="80" height="30">
					<input autoFocus value={edge.label || ''} onChange={(e) => documentStore.updateEdge(edge.id, { label: e.target.value })} onBlur={() => setIsEditing(false)} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(false); }} className="h-full w-full rounded border border-indigo-500 bg-slate-800 text-center text-xs text-white focus:outline-none" />
				</foreignObject>
			) : edge.label ? (
				<>
					<rect x={midPoint.x - edge.label.length * 4 - 4} y={midPoint.y - 10} width={edge.label.length * 8 + 8} height="20" rx="4" fill="#0f172a" className="stroke-slate-700" />
					<text x={midPoint.x} y={midPoint.y} dy="4" textAnchor="middle" className="pointer-events-none fill-slate-300 text-[10px] select-none">{edge.label}</text>
				</>
			) : null}
			<defs>
				<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b" /></marker>
			</defs>
		</g>
	);
}
