const NODE_TYPE_MAP = {
  start: "start-end",
  end: "start-end",
  process: "process",
  decision: "decision",
  entity: "entity",
  actor: "actor",
  io: "input-output",
  db: "database",
  database: "database",
  text: "text",
  lifeline: "lifeline",
  usecase: "usecase",
  rel: "relationship",
  attr: "attribute"
};
const NODE_W = 140;
const NODE_H = 60;
const GAP_X = 180;
const GAP_Y = 100;
function transformAST(ast) {
  const labelToId = {};
  const idToLabel = {};
  const idToType = {};
  ast.nodes.forEach((astNode, index) => {
    const id = `n${index + 1}`;
    const label = astNode.label || "Node";
    let mappedType = "process";
    const t = astNode.nodeType?.toLowerCase() || "process";
    if (NODE_TYPE_MAP[t]) {
      mappedType = NODE_TYPE_MAP[t];
    } else if ([
      "process",
      "decision",
      "start-end",
      "entity",
      "actor",
      "attribute",
      "relationship",
      "usecase",
      "lifeline",
      "text",
      "input-output",
      "database"
    ].includes(t)) {
      mappedType = t;
    }
    labelToId[label] = id;
    idToLabel[id] = label;
    idToType[id] = mappedType;
    if (astNode.nodeType === "start") labelToId["start"] = id;
    if (astNode.nodeType === "end") labelToId["end"] = id;
  });
  const edges = [];
  const children = {};
  const parents = {};
  const allIds = Array.from(new Set(Object.values(labelToId)));
  allIds.forEach((id) => {
    children[id] = [];
    parents[id] = [];
  });
  ast.edges.forEach((astEdge, index) => {
    const sourceId = labelToId[astEdge.source || ""] || astEdge.source;
    const targetId = labelToId[astEdge.target || ""] || astEdge.target;
    if (sourceId && targetId && children[sourceId] !== void 0 && children[targetId] !== void 0) {
      edges.push({
        id: `e${index + 1}`,
        source: sourceId,
        target: targetId,
        label: astEdge.edgeLabel,
        type: "step"
        // Default to orthogonal for clearer flowcharts
      });
      if (!children[sourceId].includes(targetId)) {
        children[sourceId].push(targetId);
      }
      if (!parents[targetId].includes(sourceId)) {
        parents[targetId].push(sourceId);
      }
    }
  });
  const roots = allIds.filter((id) => parents[id].length === 0);
  if (roots.length === 0 && allIds.length > 0) roots.push(allIds[0]);
  const layer = {};
  const visited = /* @__PURE__ */ new Set();
  const queue = [];
  roots.forEach((r) => {
    queue.push({ id: r, depth: 0 });
    visited.add(r);
  });
  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    layer[id] = Math.max(layer[id] ?? 0, depth);
    for (const childId of children[id]) {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({ id: childId, depth: depth + 1 });
      }
    }
  }
  const currentMaxLayer = Math.max(...Object.values(layer), -1);
  allIds.forEach((id) => {
    if (layer[id] === void 0) {
      layer[id] = 0;
    }
  });
  const maxLayer = Math.max(...Object.values(layer), 0);
  const layers = [];
  for (let i = 0; i <= maxLayer; i++) layers.push([]);
  allIds.sort();
  allIds.forEach((id) => {
    const l = layer[id] ?? 0;
    if (layers[l]) layers[l].push(id);
  });
  const positionInLayer = {};
  layers[0].forEach((id, i) => {
    positionInLayer[id] = i;
  });
  for (let l = 1; l <= maxLayer; l++) {
    layers[l].sort((a, b) => {
      const aParents = parents[a].filter((p) => layer[p] < l);
      const bParents = parents[b].filter((p) => layer[p] < l);
      const aMedian = aParents.length > 0 ? aParents.reduce((sum, p) => sum + (positionInLayer[p] ?? 0), 0) / aParents.length : 0;
      const bMedian = bParents.length > 0 ? bParents.reduce((sum, p) => sum + (positionInLayer[p] ?? 0), 0) / bParents.length : 0;
      return aMedian - bMedian;
    });
    layers[l].forEach((id, i) => {
      positionInLayer[id] = i;
    });
  }
  const nodeX = {};
  const nodeY = {};
  const maxWidth = Math.max(...layers.map((l) => l.length));
  for (let l = 0; l <= maxLayer; l++) {
    const count = layers[l].length;
    const totalWidth = (count - 1) * GAP_X;
    const centerOffset = (maxWidth - 1) * GAP_X / 2;
    const startX = centerOffset - totalWidth / 2;
    layers[l].forEach((id, i) => {
      nodeX[id] = startX + i * GAP_X;
      nodeY[id] = 60 + l * GAP_Y;
    });
  }
  const nodes = allIds.map((id) => {
    const originalNode = ast.nodes.find((n) => (n.label || "Node") === idToLabel[id] && n.nodeType);
    const attributes = originalNode?.attributes || [];
    let height = NODE_H;
    if (attributes.length > 0) {
      height = 30 + attributes.length * 16 + 10;
    }
    return {
      id,
      type: idToType[id],
      position: {
        x: isNaN(nodeX[id]) ? 0 : nodeX[id],
        y: isNaN(nodeY[id]) ? 0 : nodeY[id]
      },
      width: NODE_W,
      height,
      label: idToLabel[id],
      data: {
        attributes
      }
    };
  });
  nodes.forEach((node) => {
    if (node.type === "relationship" && node.data?.attributes) {
      node.data.attributes.forEach((attr) => {
        const match = attr.match(/^"?([^"\s]+)"?\s+([^\s]+)$/);
        if (match) {
          const targetLabel = match[1];
          const cardinality = match[2];
          const targetId = labelToId[targetLabel];
          if (targetId) {
            const exists = edges.some(
              (e) => e.source === node.id && e.target === targetId || e.source === targetId && e.target === node.id
            );
            if (!exists) {
              edges.push({
                id: `e_gen_${node.id}_${targetId}`,
                source: node.id,
                target: targetId,
                label: cardinality,
                type: "straight"
              });
            }
          }
        }
      });
    }
  });
  return { nodes, edges };
}
export {
  transformAST
};
