import { MAX_HISTORY_SIZE } from '../utils/constants.js';
import { createStore } from './base';

const state = createStore({
	past: [],
	future: [],
	canUndo: false,
	canRedo: false
});

export const historyStore = {
	...state,
	push(currentState) {
		state.update((h) => {
			const past = [...h.past, currentState];
			if (past.length > MAX_HISTORY_SIZE) past.shift();
			return { past, future: [], canUndo: true, canRedo: false };
		});
	},
	undo(currentState) {
		const h = state.get();
		if (h.past.length === 0) return null;
		const past = [...h.past];
		const previousState = past.pop();
		state.set({
			past,
			future: [currentState, ...h.future],
			canUndo: past.length > 0,
			canRedo: true
		});
		return previousState;
	},
	redo(currentState) {
		const h = state.get();
		if (h.future.length === 0) return null;
		const future = [...h.future];
		const nextState = future.shift();
		state.set({
			past: [...h.past, currentState],
			future,
			canUndo: true,
			canRedo: future.length > 0
		});
		return nextState;
	},
	clear() {
		state.set({ past: [], future: [], canUndo: false, canRedo: false });
	}
};
