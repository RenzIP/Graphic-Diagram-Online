import type { Point } from './geometry';

export type RoutingType = 'straight' | 'orthogonal' | 'curved' | 'bezier' | 'step';

/**
 * Basic routing utility. In a full system, A* pathfinding avoids obstacles.
 * Here we implement basic orthogonal and curved routing algorithms based on waypoints.
 */

// Straight line between points
export function getStraightPath(points: Point[]): string {
    if (points.length < 2) return '';
    const start = points[0];
    let path = `M ${start.x},${start.y}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
}

// Step (orthogonal) routing between points without rounding
export function getStepPath(points: Point[]): string {
    if (points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        
        // Midpoint routing
        const midX = curr.x + (next.x - curr.x) / 2;
        path += ` L ${midX},${curr.y} L ${midX},${next.y} L ${next.x},${next.y}`;
    }
    return path;
}

// Draw.io style curved orthogonal routing (step with border radius)
export function getCurvedPath(points: Point[], radius = 10): string {
    if (points.length < 2) return '';
    if (points.length === 2) {
        // Just fallback to bezier if only 2 points
        const p1 = points[0];
        const p2 = points[1];
        const midY = p1.y + (p2.y - p1.y) / 2;
        return `M ${p1.x},${p1.y} C ${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;
    
    // Simplistic rounded corner implementation
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midX = curr.x + (next.x - curr.x) / 2;
        // This is a placeholder for actual rounded corner math
        path += ` L ${midX},${curr.y} L ${midX},${next.y} L ${next.x},${next.y}`;
    }
    return path;
}

// Smooth bezier curve
export function getBezierPath(points: Point[]): string {
    if (points.length < 2) return '';
    const start = points[0];
    const end = points[points.length - 1];
    
    // For a 2-point simple bezier
    if (points.length === 2) {
        // This assumes vertical flow (top-to-bottom)
        const midY = start.y + (end.y - start.y) / 2;
        return `M ${start.x},${start.y} C ${start.x},${midY} ${end.x},${midY} ${end.x},${end.y}`;
    }

    // For multiple points, we use an approximation
    let path = `M ${start.x},${start.y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = prev.x + (curr.x - prev.x) / 2;
        const midY = prev.y + (curr.y - prev.y) / 2;
        path += ` Q ${prev.x},${prev.y} ${midX},${midY} T ${curr.x},${curr.y}`;
    }
    return path;
}

export function getPathByRouting(type: RoutingType, points: Point[]): string {
    switch (type) {
        case 'straight': return getStraightPath(points);
        case 'step': return getStepPath(points);
        case 'orthogonal': return getStepPath(points); // Similar to step for now
        case 'curved': return getCurvedPath(points);
        case 'bezier': 
        default: return getBezierPath(points);
    }
}
