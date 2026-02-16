/**
 * GraDiOl DSL Transformer — AST → Semantic Model
 * Converts parsed AST into the document store format (nodes/edges)
 * Uses hierarchical graph layout for proper branching at decision nodes.
 */
import type { AST } from './parser';
import type { Node, Edge, NodeType, DocumentState } from '$lib/stores/document';

const NODE_TYPE_MAP: Record<string, NodeType> = {
    start: 'start-end',
    end: 'start-end',
    process: 'process',
    decision: 'decision',
    entity: 'entity',
    actor: 'actor'
};

const NODE_W = 140;
const NODE_H = 60;
const GAP_X = 180;  // horizontal gap between branches
const GAP_Y = 100;  // vertical gap between layers

export function transformAST(ast: AST): DocumentState {
    // ── Step 1: Create node metadata ──────────────────────────────────
    const labelToId: Record<string, string> = {};
    const idToLabel: Record<string, string> = {};
    const idToType: Record<string, NodeType> = {};

    ast.nodes.forEach((astNode, index) => {
        const id = `n${index + 1}`;
        const label = astNode.label || 'Node';
        const mappedType = NODE_TYPE_MAP[astNode.nodeType || 'process'] || 'process';

        labelToId[label] = id;
        idToLabel[id] = label;
        idToType[id] = mappedType;

        if (astNode.nodeType === 'start') labelToId['start'] = id;
        if (astNode.nodeType === 'end') labelToId['end'] = id;
    });

    // ── Step 2: Resolve edges ────────────────────────────────────────
    const edges: Edge[] = [];
    const children: Record<string, string[]> = {};   // nodeId → [target ids]
    const parents: Record<string, string[]> = {};    // nodeId → [source ids]
    const allIds = Object.values(labelToId);

    allIds.forEach(id => { children[id] = []; parents[id] = []; });

    ast.edges.forEach((astEdge, index) => {
        const sourceId = labelToId[astEdge.source || ''] || astEdge.source;
        const targetId = labelToId[astEdge.target || ''] || astEdge.target;

        if (sourceId && targetId && children[sourceId] !== undefined && children[targetId] !== undefined) {
            edges.push({
                id: `e${index + 1}`,
                source: sourceId,
                target: targetId,
                label: astEdge.edgeLabel,
                type: 'default'
            });
            if (!children[sourceId].includes(targetId)) {
                children[sourceId].push(targetId);
            }
            if (!parents[targetId].includes(sourceId)) {
                parents[targetId].push(sourceId);
            }
        }
    });

    // ── Step 3: Find root nodes (no incoming edges) ──────────────────
    const roots = allIds.filter(id => parents[id].length === 0);
    if (roots.length === 0 && allIds.length > 0) roots.push(allIds[0]);

    // ── Step 4: Assign layers via BFS ────────────────────────────────
    const layer: Record<string, number> = {};
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [];

    roots.forEach(r => { queue.push({ id: r, depth: 0 }); visited.add(r); });

    while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        // Use max depth encountered (handles merge nodes correctly)
        layer[id] = Math.max(layer[id] ?? 0, depth);

        for (const childId of children[id]) {
            if (!visited.has(childId)) {
                visited.add(childId);
                queue.push({ id: childId, depth: depth + 1 });
            } else {
                // Already visited — but if this path gives a deeper layer, update
                if (depth + 1 > (layer[childId] ?? 0)) {
                    layer[childId] = depth + 1;
                    queue.push({ id: childId, depth: depth + 1 });
                }
            }
        }
    }

    // Also assign layers for any disconnected nodes
    allIds.forEach(id => { if (layer[id] === undefined) layer[id] = 0; });

    // ── Step 5: Group nodes by layer ─────────────────────────────────
    const maxLayer = Math.max(...Object.values(layer), 0);
    const layers: string[][] = [];
    for (let i = 0; i <= maxLayer; i++) layers.push([]);
    allIds.forEach(id => layers[layer[id]].push(id));

    // ── Step 6: Order nodes within each layer to reduce crossings ────
    // Use median heuristic: order by average position of parents
    const positionInLayer: Record<string, number> = {};

    // Initialize first layer
    layers[0].forEach((id, i) => { positionInLayer[id] = i; });

    // Forward pass: order by parent positions
    for (let l = 1; l <= maxLayer; l++) {
        layers[l].sort((a, b) => {
            const aParents = parents[a].filter(p => layer[p] < l);
            const bParents = parents[b].filter(p => layer[p] < l);
            const aMedian = aParents.length > 0
                ? aParents.reduce((sum, p) => sum + (positionInLayer[p] ?? 0), 0) / aParents.length
                : 0;
            const bMedian = bParents.length > 0
                ? bParents.reduce((sum, p) => sum + (positionInLayer[p] ?? 0), 0) / bParents.length
                : 0;
            return aMedian - bMedian;
        });
        layers[l].forEach((id, i) => { positionInLayer[id] = i; });
    }

    // ── Step 7: Calculate X positions ────────────────────────────────
    // Each layer is centered; nodes within a layer are spread by GAP_X
    const nodeX: Record<string, number> = {};
    const nodeY: Record<string, number> = {};

    // Find the widest layer to center everything
    const maxWidth = Math.max(...layers.map(l => l.length));

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

    // ── Step 8: Build final nodes ────────────────────────────────────
    const nodes: Node[] = allIds.map(id => ({
        id,
        type: idToType[id],
        position: { x: nodeX[id], y: nodeY[id] },
        width: NODE_W,
        height: NODE_H,
        label: idToLabel[id]
    }));

    return { nodes, edges };
}
