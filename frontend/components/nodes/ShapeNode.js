'use client';

import { getShapePath } from '../../lib/utils/shapes.js';

const styleMap = {
	slate: { fill: '#1e293b', stroke: '#475569' },
	red: { fill: 'rgba(127, 29, 29, 0.4)', stroke: '#ef4444' },
	green: { fill: 'rgba(20, 83, 45, 0.4)', stroke: '#22c55e' },
	amber: { fill: 'rgba(120, 53, 15, 0.4)', stroke: '#f59e0b' },
	indigo: { fill: 'rgba(49, 46, 129, 0.4)', stroke: '#6366f1' },
	cyan: { fill: 'rgba(22, 78, 99, 0.4)', stroke: '#06b6d4' },
	white: { fill: '#ffffff', stroke: '#94a3b8' }
};

export default function ShapeNode({ node }) {
	const fallback = styleMap[node.color || 'slate'] || styleMap.slate;
	const w = node.width || 120;
	const h = node.height || 60;
	const d = getShapePath(node.type, w, h);
	const fill = node.style?.fill || fallback.fill;
	const stroke = node.style?.stroke || fallback.stroke;
	const strokeWidth = node.style?.strokeWidth || 2;
	const strokeDasharray = node.style?.strokeDasharray || 'none';
	const textColor = node.style?.color || (node.color === 'white' ? '#1e293b' : '#e2e8f0');
	const fontSize = node.style?.fontSize || 14;
	const fontFamily = node.style?.fontFamily || 'sans-serif';
	const fontWeight = node.style?.fontWeight || '500';
	const opacity = node.style?.opacity ?? 1;

	if (node.type === 'text') {
		return (
			<foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: 'none', opacity }}>
				<div className="flex h-full w-full items-center justify-center overflow-hidden p-2 text-center break-words" style={{ color: textColor, fontFamily, fontSize, fontWeight, lineHeight: 1.2 }}>
					{node.label}
				</div>
			</foreignObject>
		);
	}

	return (
		<g className="group" style={{ opacity }}>
			<path d={d} className="transition-colors group-hover:stroke-indigo-400" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" />
			<foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: 'none' }}>
				<div className="flex h-full w-full items-center justify-center overflow-hidden p-2 text-center break-words" style={{ color: textColor, fontFamily, fontSize, fontWeight, lineHeight: 1.2, fontStyle: node.style?.fontStyle, textDecoration: node.style?.textDecoration }}>
					{node.label}
				</div>
			</foreignObject>
		</g>
	);
}
