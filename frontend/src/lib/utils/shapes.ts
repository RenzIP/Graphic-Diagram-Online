/**
 * SVG Paths/Polygons for generic shapes
 * Scaled or calculated based on width (w) and height (h)
 */

export function getShapePath(type: string, w: number, h: number): string {
	const cx = w / 2;
	const cy = h / 2;

	switch (type) {
		// --- Basic Shapes ---
		case 'process':
		case 'rectangle':
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
		case 'rounded':
		case 'start-end':
		case 'terminator':
			const r = Math.min(w, h) / 2;
			return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`;
		case 'decision':
		case 'diamond':
		case 'relationship':
		case 'gateway':
			return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`;
		case 'triangle':
			return `M ${cx} 0 L ${w} ${h} L 0 ${h} Z`;
		case 'circle':
		case 'ellipse':
		case 'start-event':
		case 'intermediate-event':
		case 'end-event':
		case 'attribute':
		case 'connector':
		case 'interface':
			return `M 0 ${cy} A ${cx} ${cy} 0 1 1 ${w} ${cy} A ${cx} ${cy} 0 1 1 0 ${cy} Z`;
		case 'star':
			// Simple 5-point star
			const points: number[] = [];
			for (let i = 0; i < 10; i++) {
				const angle = (i * Math.PI) / 5 - Math.PI / 2;
				const r = i % 2 === 0 ? w / 2 : w / 4;
				points.push(cx + r * Math.cos(angle));
				points.push(cy + r * Math.sin(angle));
			}
			return (
				`M ${points[0]} ${points[1]} L ` +
				points.slice(2).reduce((acc, val, i, arr) => {
					if (i % 2 === 0) return acc + `${val} ${arr[i + 1]} L `;
					return acc;
				}, '') +
				'Z'
			);
		case 'hexagon':
		case 'preparation':
			return `M ${w * 0.25} 0 L ${w * 0.75} 0 L ${w} ${cy} L ${w * 0.75} ${h} L ${w * 0.25} ${h} L 0 ${cy} Z`;
		case 'octagon':
			const o = Math.min(w, h) * 0.3;
			return `M ${o} 0 L ${w - o} 0 L ${w} ${o} L ${w} ${h - o} L ${w - o} ${h} L ${o} ${h} L 0 ${h - o} L 0 ${o} Z`;
		case 'parallelogram':
		case 'input-output':
			const p = w * 0.2;
			return `M ${p} 0 L ${w} 0 L ${w - p} ${h} L 0 ${h} Z`;
		case 'trapezoid':
		case 'manual-operation':
			const t = w * 0.2;
			return `M 0 0 L ${w} 0 L ${w - t} ${h} L ${t} ${h} Z`;
		case 'cloud':
			// Simplified cloud path
			return `M ${w * 0.25} ${h * 0.5} 
        Q ${w * 0.1} ${h * 0.2} ${w * 0.4} ${h * 0.3} 
        Q ${w * 0.5} ${h * 0.05} ${w * 0.7} ${h * 0.3} 
        Q ${w * 0.9} ${h * 0.2} ${w * 0.95} ${h * 0.5} 
        Q ${w} ${h * 0.8} ${w * 0.8} ${h * 0.9} 
        Q ${w * 0.6} ${h} ${w * 0.4} ${h * 0.9} 
        Q ${w * 0.1} ${h * 0.9} ${w * 0.05} ${h * 0.6}
        Q ${0} ${h * 0.5} ${w * 0.25} ${h * 0.5} Z`;
		case 'note':
			const fold = Math.min(w, h) * 0.2;
			return `M 0 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h} L 0 ${h} Z 
        M ${w - fold} 0 L ${w - fold} ${fold} L ${w} ${fold}`;
		case 'callout':
			return `M 0 0 L ${w} 0 L ${w} ${h * 0.7} L ${w * 0.4} ${h * 0.7} L ${w * 0.2} ${h} L ${w * 0.3} ${h * 0.7} L 0 ${h * 0.7} Z`;
		case 'cross':
			const c = Math.min(w, h) * 0.25;
			return `M ${c} 0 L ${w - c} 0 L ${w - c} ${c} L ${w} ${c} L ${w} ${h - c} L ${w - c} ${h - c} L ${w - c} ${h} L ${c} ${h} L ${c} ${h - c} L 0 ${h - c} L 0 ${c} L ${c} ${c} Z`;

		case 'cylinder':
		case 'database':
			const dy = h * 0.15;
			return `M 0 ${dy} L 0 ${h - dy} A ${w / 2} ${dy} 0 0 0 ${w} ${h - dy} L ${w} ${dy} A ${w / 2} ${dy} 0 0 0 0 ${dy} Z 
        M 0 ${dy} A ${w / 2} ${dy} 0 0 0 ${w} ${dy}`;

		// Flowchart specific
		case 'manual-input':
			const mi = h * 0.2;
			return `M 0 ${mi} L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
		case 'delay':
			return `M 0 0 L ${w * 0.8} 0 A ${w * 0.2} ${h / 2} 0 0 1 ${w * 0.8} ${h} L 0 ${h} Z`;
		case 'display':
			return `M 0 ${h / 2} L ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.2} ${h} Z`;
		case 'internal-storage':
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${w * 0.15} 0 L ${w * 0.15} ${h} M ${w * 0.15} ${h * 0.15} L ${w} ${h * 0.15}`;
		case 'card':
			return `M 0 ${h * 0.2} L ${w * 0.2} 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
		case 'collate':
			return `M 0 0 L ${w} ${h} L 0 ${h} L ${w} 0 Z`;
		case 'off-page':
			return `M 0 0 L ${w} 0 L ${w} ${h * 0.8} L ${w * 0.5} ${h} L 0 ${h * 0.8} Z`;
		case 'document':
			return `M 0 0 L ${w} 0 L ${w} ${h * 0.85} Q ${w * 0.75} ${h} ${w * 0.5} ${h * 0.85} T 0 ${h * 0.85} Z`;
		case 'multi-document':
			return `M 0 0 L ${w} 0 L ${w} ${h * 0.85} Q ${w * 0.75} ${h} ${w * 0.5} ${h * 0.85} T 0 ${h * 0.85} Z`; // Simplified

		// UML
		case 'actor':
			// Simple stickman
			const headR = w * 0.15;
			const wc = w / 2;
			return `M ${wc} ${headR * 0.5} A ${headR} ${headR} 0 1 1 ${wc} ${headR * 2.5} A ${headR} ${headR} 0 1 1 ${wc} ${headR * 0.5} 
         M ${wc} ${headR * 2.5} L ${wc} ${h * 0.7} 
         M ${wc - w * 0.3} ${h * 0.4} L ${wc + w * 0.3} ${h * 0.4} 
         M ${wc} ${h * 0.7} L ${wc - w * 0.3} ${h} M ${wc} ${h * 0.7} L ${wc + w * 0.3} ${h}`;
		case 'usecase':
			return `M 0 ${cy} A ${cx} ${cy} 0 1 1 ${w} ${cy} A ${cx} ${cy} 0 1 1 0 ${cy} Z`;
		case 'class':
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M 0 ${h * 0.25} L ${w} ${h * 0.25}`;
		case 'package':
			const tabH = h * 0.15;
			const tabW = w * 0.4;
			return `M 0 0 L ${tabW} 0 L ${tabW} ${tabH} L ${w} ${tabH} L ${w} ${h} L 0 ${h} Z M 0 ${tabH} L ${tabW} ${tabH}`;

		// ERD
		case 'entity':
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
		case 'weak-entity':
			const gap = 4;
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${gap} ${gap} L ${w - gap} ${gap} L ${w - gap} ${h - gap} L ${gap} ${h - gap} Z`;

		// Network
		case 'server':
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${w * 0.1} ${h * 0.2} L ${w * 0.9} ${h * 0.2} M ${w * 0.1} ${h * 0.5} L ${w * 0.9} ${h * 0.5} M ${w * 0.1} ${h * 0.8} L ${w * 0.9} ${h * 0.8}`;
		case 'cube':
			const dCube = w * 0.25;
			return `M 0 ${dCube} L ${w - dCube} ${dCube} L ${w - dCube} ${h} L 0 ${h} Z M 0 ${dCube} L ${dCube} 0 L ${w} 0 L ${w} ${h - dCube} L ${w - dCube} ${h} M ${w - dCube} ${dCube} L ${w} 0`;

		default:
			return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
	}
}
