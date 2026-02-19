/**
 * GraDiOl — Collaboration Store
 * Remote cursors, presence tracking, user list
 * Per Konsep Aplikasi §5.5
 */
import { writable } from 'svelte/store';

export interface RemoteUser {
	id: string;
	name: string;
	avatar_url?: string;
	color: string;
	cursor?: { x: number; y: number };
	lockedNodes: string[];
}

interface CollaborationState {
	connected: boolean;
	roomId: string | null;
	users: RemoteUser[];
	lockedNodes: Record<string, string>; // nodeId → userId
}

const CURSOR_COLORS = [
	'#6366f1',
	'#8b5cf6',
	'#06b6d4',
	'#10b981',
	'#f59e0b',
	'#ef4444',
	'#ec4899',
	'#14b8a6'
];

function createCollaborationStore() {
	const { subscribe, set, update } = writable<CollaborationState>({
		connected: false,
		roomId: null,
		users: [],
		lockedNodes: {}
	});

	return {
		subscribe,

		joinRoom(roomId: string) {
			update((s) => ({ ...s, connected: true, roomId }));
		},

		leaveRoom() {
			set({ connected: false, roomId: null, users: [], lockedNodes: {} });
		},

		addUser(user: Omit<RemoteUser, 'color' | 'lockedNodes'>) {
			update((s) => {
				const color = CURSOR_COLORS[s.users.length % CURSOR_COLORS.length];
				return {
					...s,
					users: [...s.users, { ...user, color, lockedNodes: [] }]
				};
			});
		},

		removeUser(userId: string) {
			update((s) => ({
				...s,
				users: s.users.filter((u) => u.id !== userId),
				lockedNodes: Object.fromEntries(
					Object.entries(s.lockedNodes).filter(([, uid]) => uid !== userId)
				)
			}));
		},

		updateCursor(userId: string, pos: { x: number; y: number }) {
			update((s) => ({
				...s,
				users: s.users.map((u) => (u.id === userId ? { ...u, cursor: pos } : u))
			}));
		},

		lockNode(nodeId: string, userId: string) {
			update((s) => ({
				...s,
				lockedNodes: { ...s.lockedNodes, [nodeId]: userId }
			}));
		},

		unlockNode(nodeId: string) {
			update((s) => {
				const { [nodeId]: _, ...rest } = s.lockedNodes;
				return { ...s, lockedNodes: rest };
			});
		}
	};
}

export const collaborationStore = createCollaborationStore();
