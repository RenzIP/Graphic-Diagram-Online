import type { Node } from '$lib/stores/document';

/**
 * Alignment functions for nodes
 */

export function alignNodes(
	nodes: Node[],
	type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Node[] {
	if (nodes.length < 2) return nodes;

	// Calculate bounding box of selection
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;
	nodes.forEach((n) => {
		const w = n.width || 120;
		const h = n.height || 60;
		minX = Math.min(minX, n.position.x);
		maxX = Math.max(maxX, n.position.x + w);
		minY = Math.min(minY, n.position.y);
		maxY = Math.max(maxY, n.position.y + h);
	});

	const centerX = (minX + maxX) / 2;
	const centerY = (minY + maxY) / 2;

	return nodes.map((node) => {
		const w = node.width || 120;
		const h = node.height || 60;
		let newX = node.position.x;
		let newY = node.position.y;

		switch (type) {
			case 'left':
				newX = minX;
				break;
			case 'center':
				newX = centerX - w / 2;
				break;
			case 'right':
				newX = maxX - w;
				break;
			case 'top':
				newY = minY;
				break;
			case 'middle':
				newY = centerY - h / 2;
				break;
			case 'bottom':
				newY = maxY - h;
				break;
		}

		return { ...node, position: { x: newX, y: newY } };
	});
}

export function distributeNodes(nodes: Node[], type: 'horizontal' | 'vertical'): Node[] {
	if (nodes.length < 3) return nodes;

	// Sort nodes by position
	const sorted = [...nodes].sort((a, b) => {
		if (type === 'horizontal') return a.position.x - b.position.x;
		return a.position.y - b.position.y;
	});

	const first = sorted[0];
	const last = sorted[sorted.length - 1];

	if (type === 'horizontal') {
		const start = first.position.x;
		const end = last.position.x;
		const totalSpan = end - start;
		const step = totalSpan / (sorted.length - 1);

		return sorted.map((node, i) => ({
			...node,
			position: { ...node.position, x: start + step * i }
		}));
	} else {
		const start = first.position.y;
		const end = last.position.y;
		const totalSpan = end - start;
		const step = totalSpan / (sorted.length - 1);

		return sorted.map((node, i) => ({
			...node,
			position: { ...node.position, y: start + step * i }
		}));
	}
}
