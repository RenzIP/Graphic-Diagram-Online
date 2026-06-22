'use client';

import { useStore } from '../../hooks/useStore.js';
import { documentStore } from '../../lib/stores/document.js';

export default function Minimap() {
	const document = useStore(documentStore);
	return (
		<div className="pointer-events-none absolute right-4 top-4 h-28 w-40 overflow-hidden rounded border border-slate-700 bg-slate-900/80 shadow-lg">
			<svg viewBox="0 0 1000 700" className="h-full w-full">
				{document.nodes.map((node) => <rect key={node.id} x={node.position.x} y={node.position.y} width={node.width || 120} height={node.height || 60} fill="#6366f1" opacity="0.35" />)}
			</svg>
		</div>
	);
}
