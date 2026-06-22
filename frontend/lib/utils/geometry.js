function screenToSVG(point, transform) {
  return {
    x: (point.x - transform.x) / transform.k,
    y: (point.y - transform.y) / transform.k
  };
}
function svgToScreen(point, transform) {
  return {
    x: point.x * transform.k + transform.x,
    y: point.y * transform.k + transform.y
  };
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function getSmoothPath(source, target, sourcePosition = "bottom", targetPosition = "top") {
  const deltaX = Math.abs(target.x - source.x);
  const deltaY = Math.abs(target.y - source.y);
  const controlPointDistance = Math.min(deltaX * 0.5, 150) + Math.min(deltaY * 0.5, 150);
  const getControlPoint = (pos, dir, dist) => {
    switch (dir) {
      case "top":
        return { x: pos.x, y: pos.y - dist };
      case "right":
        return { x: pos.x + dist, y: pos.y };
      case "bottom":
        return { x: pos.x, y: pos.y + dist };
      case "left":
        return { x: pos.x - dist, y: pos.y };
    }
  };
  const cp1 = getControlPoint(source, sourcePosition, controlPointDistance);
  const cp2 = getControlPoint(target, targetPosition, controlPointDistance);
  return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`;
}
function getStraightPath(source, target) {
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}
function getSmoothPolyline(points) {
  if (points.length < 2) return "";
  if (points.length === 2) return getStraightPath(points[0], points[1]);
  const path = [`M ${points[0].x} ${points[0].y}`];
  const sub = (p1, p2) => ({ x: p1.x - p2.x, y: p1.y - p2.y });
  const add = (p1, p2) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
  const mul = (p, s) => ({ x: p.x * s, y: p.y * s });
  const len = (p) => Math.sqrt(p.x * p.x + p.y * p.y);
  const fullPoints = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < fullPoints.length - 2; i++) {
    const p0 = fullPoints[i - 1];
    const p1 = fullPoints[i];
    const p2 = fullPoints[i + 1];
    const p3 = fullPoints[i + 2];
    const cp1 = add(p1, mul(sub(p2, p0), 1 / 6));
    const cp2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    path.push(`C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`);
  }
  return path.join(" ");
}
function getOrthogonalPath(source, target, sourcePosition = "bottom", targetPosition = "top") {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y}`;
}
export {
  clamp,
  getOrthogonalPath,
  getSmoothPath,
  getSmoothPolyline,
  getStraightPath,
  screenToSVG,
  svgToScreen
};
