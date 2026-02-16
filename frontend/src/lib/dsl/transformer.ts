/**
 * GraDiOl DSL Transformer — AST → Semantic Model
 * Converts parsed AST into the document store format (nodes/edges)
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

export function transformAST(ast: AST): DocumentState {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Track labels to IDs for edge resolution
    const labelToId: Record<string, string> = {};
    const GRID_X = 200;
    const GRID_Y = 120;
    const START_X = 100;
    const START_Y = 80;

    // Create nodes with auto-layout (simple vertical)
    ast.nodes.forEach((astNode, index) => {
        const id = `n${index + 1}`;
        const mappedType = NODE_TYPE_MAP[astNode.nodeType || 'process'] || 'process';
        const label = astNode.label || 'Node';

        labelToId[label] = id;
        // Also map "start" and "end" keywords
        if (astNode.nodeType === 'start') labelToId['start'] = id;
        if (astNode.nodeType === 'end') labelToId['end'] = id;

        nodes.push({
            id,
            type: mappedType,
            position: {
                x: START_X,
                y: START_Y + index * GRID_Y
            },
            width: 120,
            height: 60,
            label
        });
    });

    // Create edges by resolving labels to node IDs
    ast.edges.forEach((astEdge, index) => {
        const sourceId = labelToId[astEdge.source || ''] || astEdge.source;
        const targetId = labelToId[astEdge.target || ''] || astEdge.target;

        if (sourceId && targetId) {
            edges.push({
                id: `e${index + 1}`,
                source: sourceId,
                target: targetId,
                label: astEdge.edgeLabel,
                type: 'default'
            });
        }
    });

    return { nodes, edges };
}
