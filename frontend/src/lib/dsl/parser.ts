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
    nodeType?: string;       // start, process, decision, end, entity, actor
    label?: string;
    source?: string;
    target?: string;
    edgeLabel?: string;
    diagramType?: string;    // flowchart, erd, usecase
    title?: string;
}

export interface AST {
    diagramType: string;
    title: string;
    nodes: ASTNode[];
    edges: ASTNode[];
}

export function parseDSL(text: string): AST {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));

    const ast: AST = {
        diagramType: 'flowchart',
        title: 'Untitled',
        nodes: [],
        edges: []
    };

    for (const line of lines) {
        // Meta: @flowchart "Title"
        const metaMatch = line.match(/^@(\w+)\s+"([^"]+)"$/);
        if (metaMatch) {
            ast.diagramType = metaMatch[1];
            ast.title = metaMatch[2];
            continue;
        }

        // Edge with label: "Source" --label--> "Target"
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

        // Edge: "Source" -> "Target" or source -> "Target"
        const edgeMatch = line.match(/^"?([^"]+)"?\s+->\s+"?([^"]+)"?$/);
        if (edgeMatch) {
            ast.edges.push({
                type: 'edge',
                source: edgeMatch[1],
                target: edgeMatch[2]
            });
            continue;
        }

        // Node: type "Label"
        const nodeMatch = line.match(/^(\w+)\s+"([^"]+)"$/);
        if (nodeMatch) {
            ast.nodes.push({
                type: 'node',
                nodeType: nodeMatch[1],
                label: nodeMatch[2]
            });
            continue;
        }
    }

    return ast;
}
