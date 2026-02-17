import { writable } from 'svelte/store';
import { api } from '$lib/utils/api';
import { historyStore } from './history';

export type NodeType = 'process' | 'decision' | 'start-end' | 'entity' | 'actor' | 'attribute' | 'relationship' | 'usecase' | 'lifeline' | 'text' | 'input-output' | 'database';

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

    const saveHistory = (currentState: DocumentState) => {
        historyStore.push(currentState);
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
                    historyStore.clear();
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Store load error:', e);
                return false;
            }
        },
        save: async (id: string, title?: string) => {
            try {
                // Get current state
                let currentState: DocumentState = initialState; // fallback
                update(s => { currentState = s; return s; });

                await api.saveDocument(id, currentState, title);
            } catch (e) {
                console.error('Store save error:', e);
                throw e;
            }
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
