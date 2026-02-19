/**
 * GraDiOl — Shared constants
 */

// Canvas
export const DEFAULT_GRID_SIZE = 20;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;
export const DEFAULT_ZOOM = 1;

// Nodes
export const DEFAULT_NODE_WIDTH = 120;
export const DEFAULT_NODE_HEIGHT = 60;
export const MIN_NODE_WIDTH = 50;
export const MIN_NODE_HEIGHT = 30;

// History
export const MAX_HISTORY_SIZE = 50;

// Colors
export const NODE_COLORS = [
	{ name: 'Indigo', value: 'indigo' },
	{ name: 'Purple', value: 'purple' },
	{ name: 'Cyan', value: 'cyan' },
	{ name: 'Emerald', value: 'emerald' },
	{ name: 'Amber', value: 'amber' },
	{ name: 'Red', value: 'red' },
	{ name: 'Pink', value: 'pink' },
	{ name: 'Slate', value: 'slate' }
] as const;

// Diagram Types
export const DIAGRAM_TYPES = [
	{ id: 'flowchart', name: 'Flowchart', icon: '⬡' },
	{ id: 'erd', name: 'ER Diagram', icon: '⊞' },
	{ id: 'usecase', name: 'Use Case', icon: '◎' },
	{ id: 'sequence', name: 'Sequence', icon: '⇅' },
	{ id: 'mindmap', name: 'Mind Map', icon: '✦' },
	{ id: 'blank', name: 'Blank Diagram', icon: '⬜' }
] as const;

// Edge types
export const EDGE_TYPES = [
	{ id: 'default', name: 'Bezier' },
	{ id: 'straight', name: 'Straight' },
	{ id: 'step', name: 'Step' }
] as const;

// Node shapes by diagram type
export const NODE_SHAPES: Record<string, { type: string; label: string; icon: string }[]> = {
	general: [
		{ type: 'process', label: 'Rectangle', icon: '▭' },
		{ type: 'rounded', label: 'Rounded', icon: '▢' },
		{ type: 'ellipse', label: 'Ellipse', icon: '○' },
		{ type: 'triangle', label: 'Triangle', icon: '△' },
		{ type: 'diamond', label: 'Diamond', icon: '◇' },
		{ type: 'parallelogram', label: 'Parallelogram', icon: '▱' },
		{ type: 'hexagon', label: 'Hexagon', icon: '⎔' },
		{ type: 'octagon', label: 'Octagon', icon: '🛑' },
		{ type: 'trapezoid', label: 'Trapezoid', icon: '⏢' },
		{ type: 'star', label: 'Star', icon: '★' },
		{ type: 'cloud', label: 'Cloud', icon: '☁' },
		{ type: 'note', label: 'Note', icon: '📝' },
		{ type: 'callout', label: 'Callout', icon: '💬' },
		{ type: 'cylinder', label: 'Cylinder', icon: '⛁' },
		{ type: 'cube', label: 'Cube', icon: '📦' },
		{ type: 'cross', label: 'Cross', icon: '✚' },
		{ type: 'text', label: 'Text', icon: 'T' }
	],
	flowchart: [
		{ type: 'start-end', label: 'Start / End', icon: '⬭' },
		{ type: 'process', label: 'Process', icon: '▭' },
		{ type: 'decision', label: 'Decision', icon: '◇' },
		{ type: 'terminator', label: 'Terminator', icon: '⬬' },
		{ type: 'input-output', label: 'Input / Output', icon: '▱' },
		{ type: 'manual-input', label: 'Manual Input', icon: '⌨' },
		{ type: 'manual-operation', label: 'Manual Op', icon: '⚙' },
		{ type: 'preparation', label: 'Preparation', icon: '⬡' },
		{ type: 'delay', label: 'Delay', icon: 'D' },
		{ type: 'display', label: 'Display', icon: '🖥' },
		{ type: 'document', label: 'Document', icon: '📄' },
		{ type: 'multi-document', label: 'Multi-Document', icon: '📚' },
		{ type: 'database', label: 'Database', icon: '⛁' },
		{ type: 'internal-storage', label: 'Internal Storage', icon: '▦' },
		{ type: 'collate', label: 'Collate', icon: '⧖' },
		{ type: 'off-page', label: 'Off-Page Connector', icon: '⬇' }
	],
	uml: [
		{ type: 'actor', label: 'Actor', icon: '웃' },
		{ type: 'usecase', label: 'Use Case', icon: '⬭' },
		{ type: 'class', label: 'Class', icon: '▭' },
		{ type: 'interface', label: 'Interface', icon: '○' },
		{ type: 'package', label: 'Package', icon: '📁' },
		{ type: 'note', label: 'Note', icon: '📝' },
		{ type: 'process', label: 'Object', icon: '▭' }
	],
	erd: [
		{ type: 'entity', label: 'Entity', icon: '▭' },
		{ type: 'weak-entity', label: 'Weak Entity', icon: '◳' },
		{ type: 'attribute', label: 'Attribute', icon: '○' },
		{ type: 'relationship', label: 'Relationship', icon: '◇' }
	],
	bpmn: [
		{ type: 'start-event', label: 'Start Event', icon: '○' },
		{ type: 'intermediate-event', label: 'Intermediate', icon: '◎' },
		{ type: 'end-event', label: 'End Event', icon: '◉' },
		{ type: 'gateway', label: 'Gateway', icon: '◇' },
		{ type: 'process', label: 'Task', icon: '▭' }
	],
	network: [
		{ type: 'server', label: 'Server', icon: '🖥' },
		{ type: 'database', label: 'DB Server', icon: '⛁' },
		{ type: 'cloud', label: 'Cloud', icon: '☁' }
	],
	arrows: [
		{ type: 'arrow-left', label: 'Left Arrow', icon: '←' },
		{ type: 'arrow-right', label: 'Right Arrow', icon: '→' }
	]
};

// Create a 'blank' or 'general' type that aggregates all unique shapes
const allShapesMap = new Map<string, { type: string; label: string; icon: string }>();
Object.values(NODE_SHAPES)
	.flat()
	.forEach((s) => allShapesMap.set(s.type, s));
// Override label for generic types if needed, but for now just unique by type
// Wait, 'process' is used with different labels. We want ALL variants?
// Sidebar filters by unique TYPE usually.
// If we want "Process" (Flowchart) and "System" (UseCase) - they are both 'process' type but different semantic.
// But implementation is same for 'process'.
// So we just need unique types + Maybe specialized labels.
// Let's just create a list of all UNIQUE types available.
export const ALL_SHAPES = Array.from(allShapesMap.values());
NODE_SHAPES['blank'] = ALL_SHAPES;
NODE_SHAPES['all'] = ALL_SHAPES;

// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
