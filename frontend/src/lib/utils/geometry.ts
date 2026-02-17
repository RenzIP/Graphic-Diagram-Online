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
      case 'top': return { x: pos.x, y: pos.y - dist };
      case 'right': return { x: pos.x + dist, y: pos.y };
      case 'bottom': return { x: pos.x, y: pos.y + dist };
      case 'left': return { x: pos.x - dist, y: pos.y };
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
    const p1 = fullPoints[i];     // Current (Start of segment)
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
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  // Simple step logic
  return `M ${source.x} ${source.y} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y}`;
}
