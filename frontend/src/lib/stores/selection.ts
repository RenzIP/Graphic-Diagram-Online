import { writable } from 'svelte/store';

function createSelectionStore() {
	const { subscribe, set, update } = writable<{ nodes: string[]; edges: string[] }>({
		nodes: [],
		edges: []
	});

	return {
		subscribe,
		selectNode: (id: string, multi: boolean = false) =>
			update((s) => ({
				nodes: multi
					? s.nodes.includes(id)
						? s.nodes.filter((n) => n !== id)
						: [...s.nodes, id]
					: [id],
				edges: multi ? s.edges : []
			})),
		selectEdge: (id: string, multi: boolean = false) =>
			update((s) => ({
				nodes: multi ? s.nodes : [],
				edges: multi
					? s.edges.includes(id)
						? s.edges.filter((e) => e !== id)
						: [...s.edges, id]
					: [id]
			})),
		selectNodes: (ids: string[], multi: boolean = false) =>
			update((s) => ({
				nodes: multi ? [...new Set([...s.nodes, ...ids])] : ids,
				edges: multi ? s.edges : []
			})),
		clear: () => set({ nodes: [], edges: [] })
	};
}

export const selectionStore = createSelectionStore();
