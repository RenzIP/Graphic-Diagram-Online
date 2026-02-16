/**
 * GraDiOl DSL Serializer — Semantic Model → Text
 * Converts document state back to DSL text (diagram-to-text)
 * Roundtrip guarantee: Text → Diagram → Text
 */
import type { DocumentState, Node } from '$lib/stores/document';

const TYPE_TO_DSL: Record<string, string> = {
    'start-end': 'start',
    'process': 'process',
    'decision': 'decision',
    'entity': 'entity',
    'actor': 'actor'
};

export function serializeToText(state: DocumentState, diagramType = 'flowchart', title = 'Untitled'): string {
    const lines: string[] = [];

    // Meta line
    lines.push(`@${diagramType} "${title}"`);
    lines.push('');

    // Build ID → label map
    const idToLabel: Record<string, string> = {};
    state.nodes.forEach(n => { idToLabel[n.id] = n.label; });

    // Detect if last node is "End" type
    const isEndNode = (n: Node) =>
        n.type === 'start-end' && n.label.toLowerCase().includes('end');

    // Node definitions
    state.nodes.forEach(node => {
        const dslType = isEndNode(node) ? 'end' : (TYPE_TO_DSL[node.type] || 'process');
        lines.push(`${dslType} "${node.label}"`);
    });

    if (state.edges.length > 0) {
        lines.push('');
    }

    // Edge definitions
    state.edges.forEach(edge => {
        const sourceLabel = idToLabel[edge.source] || edge.source;
        const targetLabel = idToLabel[edge.target] || edge.target;

        if (edge.label) {
            lines.push(`"${sourceLabel}" --${edge.label}--> "${targetLabel}"`);
        } else {
            lines.push(`"${sourceLabel}" -> "${targetLabel}"`);
        }
    });

    return lines.join('\n');
}
