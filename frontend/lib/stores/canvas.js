import { createStore } from './base';

const state = createStore({ x: 0, y: 0, k: 1 });

export const canvasStore = {
	...state,
	pan(dx, dy) {
		state.update((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
	},
	zoom(delta, center) {
		state.update((t) => {
			const zoomFactor = delta > 0 ? 1.1 : 0.9;
			const newK = Math.min(Math.max(t.k * zoomFactor, 0.1), 5);
			const dx = (center.x - t.x) * (1 - zoomFactor);
			const dy = (center.y - t.y) * (1 - zoomFactor);
			return { ...t, x: t.x + dx, y: t.y + dy, k: newK };
		});
	},
	startConnection(nodeId, handle, mousePos, modifyingEdgeId, isReversed = false) {
		state.update((s) => ({
			...s,
			connecting: { sourceNodeId: nodeId, sourceHandle: handle, mousePos, modifyingEdgeId, isReversed }
		}));
	},
	updateConnection(mousePos, candidateNodeId) {
		state.update((s) => (s.connecting ? { ...s, connecting: { ...s.connecting, mousePos, candidateNodeId } } : s));
	},
	endConnection() {
		state.update((s) => {
			const { connecting, ...rest } = s;
			return rest;
		});
	},
	setZoom(newK) {
		state.update((t) => ({ ...t, k: Math.min(Math.max(newK, 0.1), 5) }));
	},
	reset() {
		state.set({ x: 0, y: 0, k: 1 });
	}
};
