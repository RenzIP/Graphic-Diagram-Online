/**
 * GraDiOl DSL Parser — Text → AST
 * Parses the custom DSL format defined in Konsep Aplikasi §5.1
 *
 * Example DSL:
 *   @flowchart "Login Process"
 *   start "Mulai"
 *   process "Input Credentials"
 *   decision "Valid?"
 *   start -> "Input Credentials"
 *   "Input Credentials" -> "Valid?"
 *   "Valid?" --yes--> "Input Credentials"
 */

export interface ASTNode {
	type: 'node' | 'edge' | 'meta';
	nodeType?: string; // start, process, decision, end, entity, actor
	label?: string;
	source?: string;
	target?: string;
	edgeLabel?: string;
	diagramType?: string; // flowchart, erd, usecase
	title?: string;
	attributes?: string[]; // For entities/classes
}

export interface AST {
	diagramType: string;
	title: string;
	nodes: ASTNode[];
	edges: ASTNode[];
}

export function parseDSL(text: string): AST {
	const lines = text
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l && !l.startsWith('//'));

	const ast: AST = {
		diagramType: 'flowchart',
		title: 'Untitled',
		nodes: [],
		edges: []
	};

	let currentBlockNode: ASTNode | null = null;

	for (const line of lines) {
		// 1. Handle Block End
		if (currentBlockNode && line === '}') {
			ast.nodes.push(currentBlockNode);
			currentBlockNode = null;
			continue;
		}

		// 2. Handle Block Content
		if (currentBlockNode) {
			// Inside a block, lines are attributes
			if (!currentBlockNode.attributes) currentBlockNode.attributes = [];
			currentBlockNode.attributes.push(line);
			continue;
		}

		// 3. Meta: @flowchart "Title"
		const metaMatch = line.match(/^@(\w+)\s+"?([^"]+)"?$/);
		if (metaMatch) {
			ast.diagramType = metaMatch[1];
			ast.title = metaMatch[2];
			continue;
		}

		// 4. Edge with label: A --label--> B
		// Supports quoted or unquoted identifiers
		const edgeLabelMatch = line.match(/^"?([^"]+)"?\s+--([^-]+)-->\s+"?([^"]+)"?$/);
		if (edgeLabelMatch) {
			ast.edges.push({
				type: 'edge',
				source: edgeLabelMatch[1],
				target: edgeLabelMatch[3],
				edgeLabel: edgeLabelMatch[2]
			});
			continue;
		}

		// 5. Edge with label via colon: A -> B : Label
		// Matches: "Source" -> "Target" : Label
		const edgeColonMatch = line.match(/^"?([^"]+)"?\s+->\s+"?([^"]+)"?\s*:\s*(.+)$/);
		if (edgeColonMatch) {
			ast.edges.push({
				type: 'edge',
				source: edgeColonMatch[1],
				target: edgeColonMatch[2],
				edgeLabel: edgeColonMatch[3]
			});
			continue;
		}

		// 6. Edge: A -> B
		const edgeMatch = line.match(/^"?([^"]+)"?\s+->\s+"?([^"]+)"?$/);
		if (edgeMatch) {
			ast.edges.push({
				type: 'edge',
				source: edgeMatch[1],
				target: edgeMatch[2]
			});
			continue;
		}

		// 6. Block Start: entity Name {
		const blockStartMatch = line.match(/^(\w+)\s+"?([^"]+)"?\s*\{$/);
		if (blockStartMatch) {
			currentBlockNode = {
				type: 'node',
				nodeType: blockStartMatch[1],
				label: blockStartMatch[2],
				attributes: []
			};
			continue;
		}

		// 7. Component with quoted label: component "Label"
		const componentMatch = line.match(/^(\w+)\s+"([^"]+)"$/);
		if (componentMatch) {
			ast.nodes.push({
				type: 'node',
				nodeType: componentMatch[1],
				label: componentMatch[2]
			});
			continue;
		}

		// 8. Simple Node/Component without quotes: component Label
		const simpleNodeMatch = line.match(/^(\w+)\s+([^\s{}"\->]+)$/);
		if (simpleNodeMatch) {
			ast.nodes.push({
				type: 'node',
				nodeType: simpleNodeMatch[1],
				label: simpleNodeMatch[2]
			});
			continue;
		}
	}

	return ast;
}
