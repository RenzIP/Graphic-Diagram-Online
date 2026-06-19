export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Transform = { x: number; y: number; k: number };

/**
 * Converts screen coordinates (e.g. from mouse event) to SVG space coordinates.
 */
export function screenToSVG(point: Point, transform: Transform): Point {
	return {
		x: (point.x - transform.x) / transform.k,
		y: (point.y - transform.y) / transform.k
	};
}

/**
 * Converts SVG space coordinates to screen coordinates.
 */
export function svgToScreen(point: Point, transform: Transform): Point {
	return {
		x: point.x * transform.k + transform.x,
		y: point.y * transform.k + transform.y
	};
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Calculates a smooth bezier path between two points in the format "M x1 y1 C cp1x cp1y, cp2x cp2y, x2 y2"
 */
export function getSmoothPath(
	source: Point,
	target: Point,
	sourcePosition: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
	targetPosition: 'top' | 'right' | 'bottom' | 'left' = 'top'
): string {
	const deltaX = Math.abs(target.x - source.x);
	const deltaY = Math.abs(target.y - source.y);
	const controlPointDistance = Math.min(deltaX * 0.5, 150) + Math.min(deltaY * 0.5, 150);

	const getControlPoint = (pos: Point, dir: 'top' | 'right' | 'bottom' | 'left', dist: number) => {
		switch (dir) {
			case 'top':
				return { x: pos.x, y: pos.y - dist };
			case 'right':
				return { x: pos.x + dist, y: pos.y };
			case 'bottom':
				return { x: pos.x, y: pos.y + dist };
			case 'left':
				return { x: pos.x - dist, y: pos.y };
		}
	};

	const cp1 = getControlPoint(source, sourcePosition, controlPointDistance);
	const cp2 = getControlPoint(target, targetPosition, controlPointDistance);

	return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`;
}

export function getStraightPath(source: Point, target: Point): string {
	return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

// Catmull-Rom spline to Bezier conversion
export function getSmoothPolyline(points: Point[]): string {
	if (points.length < 2) return '';
	if (points.length === 2) return getStraightPath(points[0], points[1]);

	const path = [`M ${points[0].x} ${points[0].y}`];

	// Helper to get vector
	const sub = (p1: Point, p2: Point) => ({ x: p1.x - p2.x, y: p1.y - p2.y });
	const add = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
	const mul = (p: Point, s: number) => ({ x: p.x * s, y: p.y * s });
	const len = (p: Point) => Math.sqrt(p.x * p.x + p.y * p.y);

	// Catmull-Rom to Cubic Bezier
	// For each segment P[i] -> P[i+1]
	// Tangents at P[i] (M[i]) = k * (P[i+1] - P[i-1])
	// CP1 = P[i] + M[i] / 6 * len  (Simplified: Tension=0.5) => M[i] = (P[i+1] - P[i-1])/2
	// Bezier CP1 = P[i] + (P[i+1]-P[i-1])/6
	// Bezier CP2 = P[i+1] - (P[i+2]-P[i])/6

	// We need virtual points P[-1] and P[n]
	// Duplicate endpoints
	const fullPoints = [points[0], ...points, points[points.length - 1]];

	for (let i = 1; i < fullPoints.length - 2; i++) {
		const p0 = fullPoints[i - 1]; // Previous
		const p1 = fullPoints[i]; // Current (Start of segment)
		const p2 = fullPoints[i + 1]; // Next (End of segment)
		const p3 = fullPoints[i + 2]; // Next Next

		// Calculate control points
		// CP1 = P1 + (P2 - P0) / 6
		const cp1 = add(p1, mul(sub(p2, p0), 1 / 6));
		// CP2 = P2 - (P3 - P1) / 6
		const cp2 = sub(p2, mul(sub(p3, p1), 1 / 6));

		path.push(`C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`);
	}

	return path.join(' ');
}

export function getOrthogonalPath(
	source: Point,
	target: Point,
	sourcePosition: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
	targetPosition: 'top' | 'right' | 'bottom' | 'left' = 'top'
): string {
	const minSeg = 20; // Minimum segment length going out of a port

	// 1. Calculate the initial step out of the source
	let p1 = { ...source };
	switch (sourcePosition) {
		case 'top': p1.y -= minSeg; break;
		case 'bottom': p1.y += minSeg; break;
		case 'left': p1.x -= minSeg; break;
		case 'right': p1.x += minSeg; break;
	}

	// 2. Calculate the final step into the target
	let p2 = { ...target };
	switch (targetPosition) {
		case 'top': p2.y -= minSeg; break;
		case 'bottom': p2.y += minSeg; break;
		case 'left': p2.x -= minSeg; break;
		case 'right': p2.x += minSeg; break;
	}

	// 3. Heuristic routing between p1 and p2 based on orientations
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;

	let path = `M ${source.x} ${source.y} L ${p1.x} ${p1.y}`;

	// If source goes vertical and target goes vertical
	if (['top', 'bottom'].includes(sourcePosition) && ['top', 'bottom'].includes(targetPosition)) {
		const midY = p1.y + dy / 2;
		path += ` L ${p1.x} ${midY} L ${p2.x} ${midY}`;
	} 
	// If source goes horizontal and target goes horizontal
	else if (['left', 'right'].includes(sourcePosition) && ['left', 'right'].includes(targetPosition)) {
		const midX = p1.x + dx / 2;
		path += ` L ${midX} ${p1.y} L ${midX} ${p2.y}`;
	}
	// If source goes vertical and target goes horizontal
	else if (['top', 'bottom'].includes(sourcePosition) && ['left', 'right'].includes(targetPosition)) {
		// Just one corner needed
		path += ` L ${p1.x} ${p2.y}`;
	}
	// If source goes horizontal and target goes vertical
	else if (['left', 'right'].includes(sourcePosition) && ['top', 'bottom'].includes(targetPosition)) {
		path += ` L ${p2.x} ${p1.y}`;
	}

	path += ` L ${p2.x} ${p2.y} L ${target.x} ${target.y}`;
	return path;
}

/**
 * Calculates the exact point on the node boundary where a line connecting
 * to targetPoint intersects. Supports Rectangles, Diamonds (decision), and Ellipses (usecase/start-end).
 */
export function getNodeBoundaryPoint(
	node: { position: { x: number; y: number }; width?: number; height?: number; type: string },
	targetPoint: Point
): Point {
	const w = node.width || 120;
	const h = node.height || 60;
	const cx = node.position.x + w / 2;
	const cy = node.position.y + h / 2;

	const dx = targetPoint.x - cx;
	const dy = targetPoint.y - cy;

	// If points overlap, return center
	if (dx === 0 && dy === 0) {
		return { x: cx, y: cy };
	}

	const w2 = w / 2;
	const h2 = h / 2;

	// 1. Diamond shape (decision)
	if (node.type === 'decision') {
		const t = 1 / (Math.abs(dx) / w2 + Math.abs(dy) / h2);
		return {
			x: cx + t * dx,
			y: cy + t * dy
		};
	}

	// 2. Ellipse shapes (usecase, start-end)
	if (node.type === 'usecase' || node.type === 'start-end') {
		const t = 1 / Math.sqrt((dx * dx) / (w2 * w2) + (dy * dy) / (h2 * h2));
		return {
			x: cx + t * dx,
			y: cy + t * dy
		};
	}

	// 3. Rectangle shape (default for everything else)
	const absDx = Math.abs(dx);
	const absDy = Math.abs(dy);

	const tx = absDx > 0 ? w2 / absDx : Infinity;
	const ty = absDy > 0 ? h2 / absDy : Infinity;

	const t = Math.min(tx, ty);

	return {
		x: cx + t * dx,
		y: cy + t * dy
	};
}

