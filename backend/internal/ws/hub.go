package ws

import (
	"sync"

	"github.com/fasthttp/websocket"
)

// Client represents a single WebSocket connection
type Client struct {
	ID   string
	Name string
	Conn *websocket.Conn
	Room string
	mu   sync.Mutex
}

func (c *Client) Send(msg []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.Conn.WriteMessage(websocket.TextMessage, msg)
}

// Room represents a collaboration room (1 document = 1 room)
type Room struct {
	ID      string
	Clients map[string]*Client // clientID → Client
	Locks   map[string]string  // nodeID → clientID
	mu      sync.RWMutex
}

func NewRoom(id string) *Room {
	return &Room{
		ID:      id,
		Clients: make(map[string]*Client),
		Locks:   make(map[string]string),
	}
}

func (r *Room) AddClient(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Clients[client.ID] = client
}

func (r *Room) RemoveClient(clientID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.Clients, clientID)

	// Release all locks held by this client
	for nodeID, lockerID := range r.Locks {
		if lockerID == clientID {
			delete(r.Locks, nodeID)
		}
	}
}

func (r *Room) Broadcast(msg []byte, excludeID string) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for id, client := range r.Clients {
		if id != excludeID {
			_ = client.Send(msg)
		}
	}
}

func (r *Room) LockNode(nodeID, clientID string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if existing, ok := r.Locks[nodeID]; ok && existing != clientID {
		return false // Already locked by someone else
	}
	r.Locks[nodeID] = clientID
	return true
}

func (r *Room) UnlockNode(nodeID, clientID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.Locks[nodeID] == clientID {
		delete(r.Locks, nodeID)
	}
}

func (r *Room) IsEmpty() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Clients) == 0
}

// Hub manages all rooms
type Hub struct {
	rooms map[string]*Room
	mu    sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		rooms: make(map[string]*Room),
	}
}

func (h *Hub) GetOrCreateRoom(roomID string) *Room {
	h.mu.Lock()
	defer h.mu.Unlock()
	if room, ok := h.rooms[roomID]; ok {
		return room
	}
	room := NewRoom(roomID)
	h.rooms[roomID] = room
	return room
}

func (h *Hub) RemoveRoomIfEmpty(roomID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if room, ok := h.rooms[roomID]; ok && room.IsEmpty() {
		delete(h.rooms, roomID)
	}
}
