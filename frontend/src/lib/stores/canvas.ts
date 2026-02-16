import { writable } from 'svelte/store';
import type { Transform } from '../utils/geometry';

interface CanvasState {
    x: number;
    y: number;
    k: number;
    connecting?: {
        sourceNodeId: string;
        sourceHandle: 'top' | 'right' | 'bottom' | 'left';
        mousePos: { x: number; y: number };
        candidateNodeId?: string;
    };
}

function createCanvasStore() {
    const { subscribe, set, update } = writable<CanvasState>({ x: 0, y: 0, k: 1 });

    return {
        subscribe,
        set,
        update,
        pan: (dx: number, dy: number) =>
            update((t) => ({ ...t, x: t.x + dx, y: t.y + dy })),
        zoom: (delta: number, center: { x: number; y: number }) =>
            update((t) => {
                const zoomFactor = delta > 0 ? 1.1 : 0.9;
                const newK = Math.min(Math.max(t.k * zoomFactor, 0.1), 5);

                const dx = (center.x - t.x) * (1 - zoomFactor);
                const dy = (center.y - t.y) * (1 - zoomFactor);

                return {
                    ...t,
                    x: t.x + dx,
                    y: t.y + dy,
                    k: newK
                };
            }),
        startConnection: (nodeId: string, handle: 'top' | 'right' | 'bottom' | 'left', mousePos: { x: number, y: number }) =>
            update(s => ({ ...s, connecting: { sourceNodeId: nodeId, sourceHandle: handle, mousePos } })),
        updateConnection: (mousePos: { x: number, y: number }, candidateNodeId?: string) =>
            update(s => s.connecting ? { ...s, connecting: { ...s.connecting, mousePos, candidateNodeId } } : s),
        endConnection: () => update(s => {
            const { connecting, ...rest } = s;
            return rest as CanvasState;
        }),
        reset: () => set({ x: 0, y: 0, k: 1 })
    };
}

export const canvasStore = createCanvasStore();
