import { writable } from 'svelte/store';
import { api } from '$lib/utils/api';

export type NodeType = 'process' | 'decision' | 'start-end' | 'entity' | 'actor' | 'attribute' | 'relationship' | 'usecase' | 'lifeline' | 'text';

export interface Node {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    width?: number; // Optional, some nodes auto-size
    height?: number;
    label: string;
    color?: string; // e.g. 'indigo', 'red', 'green', 'amber'
    data?: any; // Additional custom data
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    type?: 'default' | 'step' | 'straight' | 'bezier';
    label?: string;
    waypoints?: { x: number; y: number }[];
}

export interface DocumentState {
    nodes: Node[];
    edges: Edge[];
}

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

    // History management
    let history: DocumentState[] = [];
    let future: DocumentState[] = [];

    const saveHistory = (currentState: DocumentState) => {
        history.push(currentState);
        if (history.length > 50) history.shift();
        future = [];
    };

    return {
        subscribe,
        set,
        update,

        // API Actions
        load: async (id: string): Promise<boolean> => {
            try {
                const doc = await api.getDocument(id);
                if (doc) {
                    set(doc);
                    history = [];
                    future = [];
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Store load error:', e);
                return false;
            }
        },
        save: async (id: string, title?: string) => {
            let currentState: DocumentState;
            update(s => { currentState = s; return s; });
            await api.saveDocument(id, currentState!, title);
        },

        // Editor Actions
        undo: () => {
            update(currentState => {
                if (history.length === 0) return currentState;
                const previousState = history.pop()!;
                future.push(currentState);
                return previousState;
            });
        },
        redo: () => {
            update(currentState => {
                if (future.length === 0) return currentState;
                const nextState = future.pop()!;
                history.push(currentState);
                return nextState;
            });
        },
        addNode: (node: Node) => update(s => {
            saveHistory(s);
            return { ...s, nodes: [...s.nodes, node] };
        }),
        updateNode: (id: string, partial: Partial<Node>) =>
            update(s => {
                saveHistory(s);
                return {
                    ...s,
                    nodes: s.nodes.map(n => (n.id === id ? { ...n, ...partial } : n))
                };
            }),
        removeNode: (id: string) =>
            update(s => {
                saveHistory(s);
                return {
                    ...s,
                    nodes: s.nodes.filter(n => n.id !== id),
                    edges: s.edges.filter(e => e.source !== id && e.target !== id)
                };
            }),
        addEdge: (edge: Edge) => update(s => {
            saveHistory(s);
            return { ...s, edges: [...s.edges, edge] };
        }),
        updateEdge: (id: string, partial: Partial<Edge>) => update(s => {
            saveHistory(s);
            return {
                ...s,
                edges: s.edges.map(e => (e.id === id ? { ...e, ...partial } : e))
            };
        }),
        removeEdge: (id: string) => update(s => {
            saveHistory(s);
            return { ...s, edges: s.edges.filter(e => e.id !== id) };
        })
    };
}

export const documentStore = createDocumentStore();
