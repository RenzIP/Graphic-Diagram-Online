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
    { id: 'mindmap', name: 'Mind Map', icon: '✦' }
] as const;

// Edge types
export const EDGE_TYPES = [
    { id: 'default', name: 'Bezier' },
    { id: 'straight', name: 'Straight' },
    { id: 'step', name: 'Step' }
] as const;

// Node shapes by diagram type
export const NODE_SHAPES: Record<string, { type: string; label: string; icon: string }[]> = {
    flowchart: [
        { type: 'start-end', label: 'Start / End', icon: '⬭' },
        { type: 'process', label: 'Process', icon: '▭' },
        { type: 'decision', label: 'Decision', icon: '◇' }
    ],
    erd: [
        { type: 'entity', label: 'Entity', icon: '▭' },
        { type: 'process', label: 'Attribute', icon: '○' }
    ],
    usecase: [
        { type: 'actor', label: 'Actor', icon: '🧑' },
        { type: 'process', label: 'Use Case', icon: '⬭' }
    ],
    sequence: [
        { type: 'process', label: 'Participant', icon: '▭' }
    ],
    mindmap: [
        { type: 'process', label: 'Topic', icon: '▭' },
        { type: 'start-end', label: 'Central', icon: '⬭' }
    ]
};

// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
