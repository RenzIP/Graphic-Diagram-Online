/**
 * GraDiOl — History Store (Undo/Redo)
 * Dedicated command stack per Konsep Aplikasi §5.2
 */
import { writable, get } from 'svelte/store';
import type { DocumentState } from './document';
import { MAX_HISTORY_SIZE } from '$lib/utils/constants';

interface HistoryState {
	past: DocumentState[];
	future: DocumentState[];
	canUndo: boolean;
	canRedo: boolean;
}

function createHistoryStore() {
	const { subscribe, set, update } = writable<HistoryState>({
		past: [],
		future: [],
		canUndo: false,
		canRedo: false
	});

	return {
		subscribe,

		/** Push current state before a mutation */
		push(state: DocumentState) {
			update((h) => {
				const past = [...h.past, state];
				if (past.length > MAX_HISTORY_SIZE) past.shift();
				return {
					past,
					future: [],
					canUndo: true,
					canRedo: false
				};
			});
		},

		/** Undo: pop from past, push current to future */
		undo(currentState: DocumentState): DocumentState | null {
			const h = get({ subscribe });
			if (h.past.length === 0) return null;

			const past = [...h.past];
			const previousState = past.pop()!;

			set({
				past,
				future: [currentState, ...h.future],
				canUndo: past.length > 0,
				canRedo: true
			});

			return previousState;
		},

		/** Redo: pop from future, push current to past */
		redo(currentState: DocumentState): DocumentState | null {
			const h = get({ subscribe });
			if (h.future.length === 0) return null;

			const future = [...h.future];
			const nextState = future.shift()!;

			set({
				past: [...h.past, currentState],
				future,
				canUndo: true,
				canRedo: future.length > 0
			});

			return nextState;
		},

		/** Clear all history */
		clear() {
			set({ past: [], future: [], canUndo: false, canRedo: false });
		}
	};
}

export const historyStore = createHistoryStore();
