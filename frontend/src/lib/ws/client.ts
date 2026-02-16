/**
 * GraDiOl — WebSocket Client
 * Connection manager matching protocol in Konsep Aplikasi §7.4
 */
import { WS_BASE_URL } from '$lib/utils/constants';
import { collaborationStore } from '$lib/stores/collaboration';

export type WSMessageType =
    | 'join_room' | 'lock_node' | 'unlock_node'
    | 'update_node' | 'add_node' | 'delete_node'
    | 'add_edge' | 'delete_edge' | 'cursor_move'
    | 'room_state' | 'user_joined' | 'user_left'
    | 'node_locked' | 'node_unlocked'
    | 'node_updated' | 'node_added' | 'node_deleted'
    | 'cursor_update' | 'error';

export interface WSMessage {
    type: WSMessageType;
    [key: string]: any;
}

type MessageHandler = (msg: WSMessage) => void;

class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private handlers: Map<WSMessageType, MessageHandler[]> = new Map();
    private documentId: string | null = null;

    /** Connect to a document room */
    connect(documentId: string): void {
        this.documentId = documentId;
        this.doConnect();
    }

    private doConnect(): void {
        if (!this.documentId) return;

        try {
            this.ws = new WebSocket(`${WS_BASE_URL}/${this.documentId}`);

            this.ws.onopen = () => {
                collaborationStore.joinRoom(this.documentId!);
                this.send({ type: 'join_room', room_id: this.documentId! });
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg: WSMessage = JSON.parse(event.data);
                    this.dispatch(msg);
                } catch { /* ignore parse errors */ }
            };

            this.ws.onclose = () => {
                collaborationStore.leaveRoom();
                this.scheduleReconnect();
            };

            this.ws.onerror = () => {
                this.ws?.close();
            };
        } catch {
            this.scheduleReconnect();
        }
    }

    /** Send a message to the server */
    send(msg: WSMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
    }

    /** Register a handler for a message type */
    on(type: WSMessageType, handler: MessageHandler): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type)!.push(handler);
    }

    /** Remove a handler */
    off(type: WSMessageType, handler: MessageHandler): void {
        const handlers = this.handlers.get(type);
        if (handlers) {
            this.handlers.set(type, handlers.filter(h => h !== handler));
        }
    }

    /** Disconnect and clean up */
    disconnect(): void {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.ws?.close();
        this.ws = null;
        this.documentId = null;
        collaborationStore.leaveRoom();
    }

    private dispatch(msg: WSMessage): void {
        const handlers = this.handlers.get(msg.type);
        if (handlers) {
            handlers.forEach(h => h(msg));
        }

        // Auto-handle common events
        switch (msg.type) {
            case 'user_joined':
                collaborationStore.addUser(msg.user);
                break;
            case 'user_left':
                collaborationStore.removeUser(msg.user_id);
                break;
            case 'node_locked':
                collaborationStore.lockNode(msg.node_id, msg.by);
                break;
            case 'node_unlocked':
                collaborationStore.unlockNode(msg.node_id);
                break;
            case 'cursor_update':
                collaborationStore.updateCursor(msg.user_id, { x: msg.x, y: msg.y });
                break;
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.doConnect();
        }, 3000);
    }
}

export const wsClient = new WebSocketClient();
