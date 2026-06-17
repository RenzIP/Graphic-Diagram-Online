var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { WS_BASE_URL } from "@/utils/constants";
import { collaborationStore } from "@/stores/collaboration";
class WebSocketClient {
  constructor() {
    __publicField(this, "ws", null);
    __publicField(this, "reconnectTimer", null);
    __publicField(this, "handlers", /* @__PURE__ */ new Map());
    __publicField(this, "documentId", null);
  }
  /** Connect to a document room */
  connect(documentId) {
    this.documentId = documentId;
    this.doConnect();
  }
  doConnect() {
    if (!this.documentId) return;
    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/${this.documentId}`);
      this.ws.onopen = () => {
        collaborationStore.joinRoom(this.documentId);
        this.send({ type: "join_room", room_id: this.documentId });
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.dispatch(msg);
        } catch {
        }
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
  send(msg) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
  /** Register a handler for a message type */
  on(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type).push(handler);
  }
  /** Remove a handler */
  off(type, handler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      this.handlers.set(
        type,
        handlers.filter((h) => h !== handler)
      );
    }
  }
  /** Disconnect and clean up */
  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.documentId = null;
    collaborationStore.leaveRoom();
  }
  dispatch(msg) {
    const handlers = this.handlers.get(msg.type);
    if (handlers) {
      handlers.forEach((h) => h(msg));
    }
    switch (msg.type) {
      case "user_joined":
        collaborationStore.addUser(msg.user);
        break;
      case "user_left":
        collaborationStore.removeUser(msg.user_id);
        break;
      case "node_locked":
        collaborationStore.lockNode(msg.node_id, msg.by);
        break;
      case "node_unlocked":
        collaborationStore.unlockNode(msg.node_id);
        break;
      case "cursor_update":
        collaborationStore.updateCursor(msg.user_id, { x: msg.x, y: msg.y });
        break;
    }
  }
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, 3e3);
  }
}
const wsClient = new WebSocketClient();
export {
  wsClient
};
