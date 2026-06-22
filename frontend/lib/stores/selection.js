import { createStore } from './base';

const state = createStore({ nodes: [], edges: [] });

export const selectionStore = {
	...state,
	selectNode(id, multi = false) {
		state.update((s) => ({
			nodes: multi ? (s.nodes.includes(id) ? s.nodes.filter((n) => n !== id) : [...s.nodes, id]) : [id],
			edges: multi ? s.edges : []
		}));
	},
	selectEdge(id, multi = false) {
		state.update((s) => ({
			nodes: multi ? s.nodes : [],
			edges: multi ? (s.edges.includes(id) ? s.edges.filter((e) => e !== id) : [...s.edges, id]) : [id]
		}));
	},
	selectNodes(ids, multi = false) {
		state.update((s) => ({
			nodes: multi ? [...new Set([...s.nodes, ...ids])] : ids,
			edges: multi ? s.edges : []
		}));
	},
	clear() {
		state.set({ nodes: [], edges: [] });
	}
};
