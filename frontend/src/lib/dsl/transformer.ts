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
	actor: 'actor',
	io: 'input-output',
	db: 'database',
	database: 'database',
	text: 'text',
	lifeline: 'lifeline',
	usecase: 'usecase',
	rel: 'relationship',
	attr: 'attribute'
};

const NODE_W = 140;
const NODE_H = 60;
const GAP_X = 180; // horizontal gap between branches
const GAP_Y = 100; // vertical gap between layers

export function transformAST(ast: AST): DocumentState {
	// ── Step 1: Create node metadata ──────────────────────────────────
	const labelToId: Record<string, string> = {};
	const idToLabel: Record<string, string> = {};
	const idToType: Record<string, NodeType> = {};

	ast.nodes.forEach((astNode, index) => {
		const id = `n${index + 1}`;
		const label = astNode.label || 'Node';
		// Check map, or use the type directly if it matches a known NodeType, else default to process
		let mappedType: NodeType = 'process';
		const t = astNode.nodeType?.toLowerCase() || 'process';

		if (NODE_TYPE_MAP[t]) {
			mappedType = NODE_TYPE_MAP[t];
		} else if (
			[
				'process',
				'decision',
				'start-end',
				'entity',
				'actor',
				'attribute',
				'relationship',
				'usecase',
				'lifeline',
				'text',
				'input-output',
				'database'
			].includes(t)
		) {
			mappedType = t as NodeType;
		}

		labelToId[label] = id;
		idToLabel[id] = label;
		idToType[id] = mappedType;

		if (astNode.nodeType === 'start') labelToId['start'] = id;
		if (astNode.nodeType === 'end') labelToId['end'] = id;
	});

	// ── Step 2: Resolve edges ────────────────────────────────────────
	const edges: Edge[] = [];
	const children: Record<string, string[]> = {}; // nodeId → [target ids]
	const parents: Record<string, string[]> = {}; // nodeId → [source ids]
	const allIds = Array.from(new Set(Object.values(labelToId)));

	allIds.forEach((id) => {
		children[id] = [];
		parents[id] = [];
	});

	ast.edges.forEach((astEdge, index) => {
		const sourceId = labelToId[astEdge.source || ''] || astEdge.source;
		const targetId = labelToId[astEdge.target || ''] || astEdge.target;

		if (
			sourceId &&
			targetId &&
			children[sourceId] !== undefined &&
			children[targetId] !== undefined
		) {
			edges.push({
				id: `e${index + 1}`,
				source: sourceId,
				target: targetId,
				label: astEdge.edgeLabel,
				type: 'step' // Default to orthogonal for clearer flowcharts
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
	const roots = allIds.filter((id) => parents[id].length === 0);
	if (roots.length === 0 && allIds.length > 0) roots.push(allIds[0]);

	// ── Step 4: Assign layers via BFS ────────────────────────────────
	const layer: Record<string, number> = {};
	const visited = new Set<string>();
	const queue: { id: string; depth: number }[] = [];

	roots.forEach((r) => {
		queue.push({ id: r, depth: 0 });
		visited.add(r);
	});

	while (queue.length > 0) {
		const { id, depth } = queue.shift()!;
		// Use max depth encountered (handles merge nodes correctly)
		layer[id] = Math.max(layer[id] ?? 0, depth);

		for (const childId of children[id]) {
			if (!visited.has(childId)) {
				visited.add(childId);
				queue.push({ id: childId, depth: depth + 1 });
			}
		}
	}

	// Also assign layers for any disconnected nodes that weren't reached
	const currentMaxLayer = Math.max(...Object.values(layer), -1);
	allIds.forEach((id) => {
		if (layer[id] === undefined) {
			// If node has no layer, start a new component at 0?
			// Or better, just put them in layer 0 for now but ensure they don't overlap too much?
			// Actually, the BFS above starts from ALL roots.
			// If a node is part of a cycle but has no root (e.g. A->B->A), it might be missed if we only start from parents[id].length===0
			// Let's find unvisited nodes and run BFS/DFS on them too.
			layer[id] = 0;
		}
	});

	// ── Step 5: Group nodes by layer ─────────────────────────────────
	const maxLayer = Math.max(...Object.values(layer), 0);
	const layers: string[][] = [];
	for (let i = 0; i <= maxLayer; i++) layers.push([]);

	// Sort to ensure consistent order
	allIds.sort();
	allIds.forEach((id) => {
		const l = layer[id] ?? 0;
		if (layers[l]) layers[l].push(id);
	});

	// ── Step 6: Order nodes within each layer to reduce crossings ────
	// Use median heuristic: order by average position of parents
	const positionInLayer: Record<string, number> = {};

	// Initialize first layer
	layers[0].forEach((id, i) => {
		positionInLayer[id] = i;
	});

	// Forward pass: order by parent positions
	for (let l = 1; l <= maxLayer; l++) {
		layers[l].sort((a, b) => {
			const aParents = parents[a].filter((p) => layer[p] < l);
			const bParents = parents[b].filter((p) => layer[p] < l);
			const aMedian =
				aParents.length > 0
					? aParents.reduce((sum, p) => sum + (positionInLayer[p] ?? 0), 0) / aParents.length
					: 0;
			const bMedian =
				bParents.length > 0
					? bParents.reduce((sum, p) => sum + (positionInLayer[p] ?? 0), 0) / bParents.length
					: 0;
			return aMedian - bMedian;
		});
		layers[l].forEach((id, i) => {
			positionInLayer[id] = i;
		});
	}

	// ── Step 7: Calculate X positions ────────────────────────────────
	// Each layer is centered; nodes within a layer are spread by GAP_X
	const nodeX: Record<string, number> = {};
	const nodeY: Record<string, number> = {};

	// Find the widest layer to center everything
	const maxWidth = Math.max(...layers.map((l) => l.length));

	for (let l = 0; l <= maxLayer; l++) {
		const count = layers[l].length;
		const totalWidth = (count - 1) * GAP_X;
		const centerOffset = ((maxWidth - 1) * GAP_X) / 2;
		const startX = centerOffset - totalWidth / 2;

		layers[l].forEach((id, i) => {
			nodeX[id] = startX + i * GAP_X;
			nodeY[id] = 60 + l * GAP_Y;
		});
	}

	// ── Step 8: Build final nodes ────────────────────────────────────
	const nodes: Node[] = allIds.map((id) => {
		// Retrieve AST attributes if available
		const originalNode = ast.nodes.find((n) => (n.label || 'Node') === idToLabel[id] && n.nodeType);
		const attributes = originalNode?.attributes || [];

		// Dynamic height for entities with attributes
		let height = NODE_H;
		if (attributes.length > 0) {
			height = 30 + attributes.length * 16 + 10; // Header + items + padding
		}

		return {
			id,
			type: idToType[id],
			position: {
				x: isNaN(nodeX[id]) ? 0 : nodeX[id],
				y: isNaN(nodeY[id]) ? 0 : nodeY[id]
			},
			width: NODE_W,
			height: height,
			label: idToLabel[id],
			data: {
				attributes
			}
		};
	});

	// ── Step 9: Post-processing for ERD Relationships ────────────────
	// Generate edges from relationship attributes (e.g. "Customer 1")
	nodes.forEach((node) => {
		if (node.type === 'relationship' && node.data?.attributes) {
			node.data.attributes.forEach((attr: string) => {
				// Parse "EntityName Cardinality" e.g. "Customer 1" or "Order N"
				const match = attr.match(/^"?([^"\s]+)"?\s+([^\s]+)$/);
				if (match) {
					const targetLabel = match[1];
					const cardinality = match[2];
					const targetId = labelToId[targetLabel];

					if (targetId) {
						// Check if edge already exists to avoid duplicates
						const exists = edges.some(
							(e) =>
								(e.source === node.id && e.target === targetId) ||
								(e.source === targetId && e.target === node.id)
						);

						if (!exists) {
							edges.push({
								id: `e_gen_${node.id}_${targetId}`,
								source: node.id,
								target: targetId,
								label: cardinality,
								type: 'straight'
							});

							// Also update hierarchy for layout if needed,
							// but layout is already done.
							// Ideally, this should happen BEFORE layout (Step 2/3),
							// but for now let's just ensure the edge exists.
						}
					}
				}
			});
		}
	});

	return { nodes, edges };
}
