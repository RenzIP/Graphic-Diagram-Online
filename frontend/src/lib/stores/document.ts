import { writable, get } from 'svelte/store';
import { documentsApi } from '$lib/api/documents';
import type { DocumentContent, DocumentView, DocumentUpdateRequest } from '$lib/api/types';
import { historyStore } from './history';

export type NodeType = 'process' | 'decision' | 'start-end' | 'entity' | 'actor' | 'attribute' | 'relationship' | 'usecase' | 'lifeline' | 'text' | 'input-output' | 'database';

export interface Node {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    width?: number;
    height?: number;
    label?: string;
    // Legacy
    color?: string;
    data?: any; // Additional custom data
    // New
    style?: {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
        opacity?: number;
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string | number;
        fontStyle?: string;
        textDecoration?: string;
        color?: string; // Text color
        shadow?: boolean;
        gradient?: boolean;
    };
    locked?: boolean;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    type?: 'default' | 'step' | 'straight' | 'bezier';
    label?: string;
    waypoints?: { x: number; y: number }[];
    // Visual Styling
    animated?: boolean;
    style?: {
        stroke?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
        opacity?: number;
    };
    markerStart?: string; // e.g. 'arrow', 'circle'
    markerEnd?: string;
}

export interface DocumentState {
    nodes: Node[];
    edges: Edge[];
}

// ── Conversion: flat DocumentState ↔ API content+view split ──

/** Convert flat DocumentState → API DocumentContent (semantic-only) */
export function toDocumentContent(state: DocumentState): DocumentContent {
    return {
        nodes: state.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            label: n.label,
            properties: {
                ...(n.data ?? {}),
                ...(n.width != null ? { width: n.width } : {}),
                ...(n.height != null ? { height: n.height } : {}),
                ...(n.locked != null ? { locked: n.locked } : {}),
            }
        })),
        edges: state.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            type: e.type
        }))
    };
}

/** Convert flat DocumentState → API DocumentView (visual overrides) */
export function toDocumentView(state: DocumentState): DocumentView {
    const positions: Record<string, { x: number; y: number }> = {};
    const styles: Record<string, Record<string, unknown>> = {};
    const routing: Record<string, unknown> = {};

    for (const node of state.nodes) {
        positions[node.id] = { x: node.position.x, y: node.position.y };
        if (node.style || node.color) {
            styles[node.id] = { ...(node.style ?? {}), ...(node.color ? { color: node.color } : {}) };
        }
    }

    for (const edge of state.edges) {
        const edgeRouting: Record<string, unknown> = {};
        if (edge.waypoints) edgeRouting.waypoints = edge.waypoints;
        if (edge.animated != null) edgeRouting.animated = edge.animated;
        if (edge.style) edgeRouting.style = edge.style;
        if (edge.markerStart) edgeRouting.markerStart = edge.markerStart;
        if (edge.markerEnd) edgeRouting.markerEnd = edge.markerEnd;
        if (Object.keys(edgeRouting).length > 0) {
            routing[edge.id] = edgeRouting;
        }
    }

    return { positions, styles, routing };
}

/** Convert API content+view → flat DocumentState */
export function fromApiDocument(content: DocumentContent, view: DocumentView): DocumentState {
    const nodes: Node[] = content.nodes.map((cn) => {
        const pos = view.positions?.[cn.id] ?? { x: 0, y: 0 };
        const nodeStyle = view.styles?.[cn.id] as Node['style'] | undefined;
        const props = cn.properties ?? {};

        return {
            id: cn.id,
            type: cn.type as NodeType,
            position: { x: pos.x, y: pos.y },
            label: cn.label,
            ...(props.width != null ? { width: props.width as number } : {}),
            ...(props.height != null ? { height: props.height as number } : {}),
            ...(props.locked != null ? { locked: props.locked as boolean } : {}),
            ...(nodeStyle ? { style: nodeStyle } : {}),
            data: Object.fromEntries(
                Object.entries(props).filter(([k]) => !['width', 'height', 'locked'].includes(k))
            )
        };
    });

    const edges: Edge[] = content.edges.map((ce) => {
        const edgeRouting = (view.routing?.[ce.id] ?? {}) as Record<string, unknown>;

        return {
            id: ce.id,
            source: ce.source,
            target: ce.target,
            label: ce.label,
            type: ce.type as Edge['type'],
            ...(edgeRouting.waypoints ? { waypoints: edgeRouting.waypoints as Edge['waypoints'] } : {}),
            ...(edgeRouting.animated != null ? { animated: edgeRouting.animated as boolean } : {}),
            ...(edgeRouting.style ? { style: edgeRouting.style as Edge['style'] } : {}),
            ...(edgeRouting.markerStart ? { markerStart: edgeRouting.markerStart as string } : {}),
            ...(edgeRouting.markerEnd ? { markerEnd: edgeRouting.markerEnd as string } : {})
        };
    });

    return { nodes, edges };
}

// ── Initial / empty state ──

const emptyState: DocumentState = { nodes: [], edges: [] };

const initialState: DocumentState = {
    nodes: [
        { id: '1', type: 'start-end', position: { x: 100, y: 100 }, label: 'Start' },
        { id: '2', type: 'process', position: { x: 100, y: 200 }, label: 'Process Check' },
        { id: '3', type: 'decision', position: { x: 100, y: 300 }, label: 'Is Valid?' },
        { id: '4', type: 'start-end', position: { x: 100, y: 500 }, label: 'End' }
    ],
    edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
    ]
};

function createDocumentStore() {
    const { subscribe, set, update } = writable<DocumentState>(initialState);

    const saveHistory = (currentState: DocumentState) => {
        historyStore.push(currentState);
    };

    return {
        subscribe,
        set,
        update,

        /** Load document from API by ID, populating store from content+view */
        load: async (id: string): Promise<boolean> => {
            try {
                const doc = await documentsApi.get(id);
                if (doc) {
                    const state = fromApiDocument(doc.content, doc.view);
                    set(state);
                    historyStore.clear();
                    return true;
                }
                return false;
            } catch (e) {
                console.error('[documentStore] load error:', e);
                return false;
            }
        },

        /** Save current store state to API, splitting into content+view */
        save: async (id: string, title?: string) => {
            try {
                const currentState = get({ subscribe });
                const payload: DocumentUpdateRequest = {
                    content: toDocumentContent(currentState),
                    view: toDocumentView(currentState),
                    ...(title ? { title } : {})
                };
                await documentsApi.update(id, payload);
            } catch (e) {
                console.error('[documentStore] save error:', e);
                throw e;
            }
        },

        /** Reset store to empty state */
        clear: () => {
            set(emptyState);
            historyStore.clear();
        },

        // Node Actions
        addNode: (node: Node) => {
            update((state) => {
                saveHistory(state);
                return { ...state, nodes: [...state.nodes, node] };
            });
        },
        updateNode: (id: string, data: Partial<Node>) => {
            update((state) => {
                saveHistory(state);
                return {
                    ...state,
                    nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n))
                };
            });
        },
        removeNode: (id: string) => {
            update((state) => {
                saveHistory(state);
                return {
                    ...state,
                    nodes: state.nodes.filter((n) => n.id !== id),
                    edges: state.edges.filter((e) => e.source !== id && e.target !== id)
                };
            });
        },

        moveNodeOrder: (id: string, direction: 'front' | 'back') => {
            update((state) => {
                saveHistory(state);
                const nodeIndex = state.nodes.findIndex((n) => n.id === id);
                if (nodeIndex === -1) return state;

                const node = state.nodes[nodeIndex];
                const newNodes = [...state.nodes];
                newNodes.splice(nodeIndex, 1);

                if (direction === 'front') {
                    newNodes.push(node);
                } else {
                    newNodes.unshift(node);
                }

                return { ...state, nodes: newNodes };
            });
        },

        // Edge Actions
        addEdge: (edge: Edge) => {
            update((state) => {
                saveHistory(state);
                return { ...state, edges: [...state.edges, edge] };
            });
        },
        updateEdge: (id: string, data: Partial<Edge>) => {
            update((state) => {
                saveHistory(state);
                return {
                    ...state,
                    edges: state.edges.map((e) => (e.id === id ? { ...e, ...data } : e))
                };
            });
        },
        removeEdge: (id: string) => {
            update((state) => {
                saveHistory(state);
                return { ...state, edges: state.edges.filter((e) => e.id !== id) };
            });
        }
    };
}

export const documentStore = createDocumentStore();
