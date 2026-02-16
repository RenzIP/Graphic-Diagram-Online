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
