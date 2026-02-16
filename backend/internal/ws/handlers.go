package ws

import (
	"encoding/json"
	"log"

	"github.com/gofiber/fiber/v2"
	gws "github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

// UpgradeMiddleware checks for WebSocket upgrade requests
func UpgradeMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if gws.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	}
}

// HandleWebSocket returns a Fiber handler for WebSocket connections
func HandleWebSocket(hub *Hub) fiber.Handler {
	return gws.New(func(c *gws.Conn) {
		documentID := c.Params("documentId")
		clientID := uuid.New().String()

		client := &Client{
			ID:   clientID,
			Name: "User-" + clientID[:8],
			Conn: c.Conn,
			Room: documentID,
		}

		room := hub.GetOrCreateRoom(documentID)
		room.AddClient(client)

		log.Printf("[WS] Client %s joined room %s", clientID, documentID)

		// Send room state to the new client
		sendRoomState(client, room)

		// Notify others
		broadcastJSON(room, clientID, Message{
			Type: TypeUserJoined,
			User: map[string]interface{}{
				"id":   clientID,
				"name": client.Name,
			},
		})

		// Read loop
		defer func() {
			room.RemoveClient(clientID)
			hub.RemoveRoomIfEmpty(documentID)

			broadcastJSON(room, "", Message{
				Type:   TypeUserLeft,
				UserID: clientID,
			})

			log.Printf("[WS] Client %s left room %s", clientID, documentID)
		}()

		for {
			_, msgBytes, err := c.ReadMessage()
			if err != nil {
				break
			}

			var msg Message
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				sendError(client, "Invalid message format")
				continue
			}

			handleMessage(client, room, msg)
		}
	})
}

func handleMessage(client *Client, room *Room, msg Message) {
	switch msg.Type {
	case TypeLockNode:
		if room.LockNode(msg.NodeID, client.ID) {
			broadcastJSON(room, "", Message{
				Type:   TypeNodeLocked,
				NodeID: msg.NodeID,
				By:     client.ID,
			})
		} else {
			sendError(client, "Node is already locked")
		}

	case TypeUnlockNode:
		room.UnlockNode(msg.NodeID, client.ID)
		broadcastJSON(room, "", Message{
			Type:   TypeNodeUnlocked,
			NodeID: msg.NodeID,
		})

	case TypeUpdateNode:
		broadcastJSON(room, client.ID, Message{
			Type:    TypeNodeUpdated,
			NodeID:  msg.NodeID,
			Changes: msg.Changes,
		})

	case TypeAddNode:
		broadcastJSON(room, client.ID, Message{
			Type: TypeNodeAdded,
			Node: msg.Node,
		})

	case TypeDeleteNode:
		room.UnlockNode(msg.NodeID, client.ID)
		broadcastJSON(room, client.ID, Message{
			Type:   TypeNodeDeleted,
			NodeID: msg.NodeID,
		})

	case TypeAddEdge:
		broadcastJSON(room, client.ID, Message{
			Type: "edge_added",
			Edge: msg.Edge,
		})

	case TypeDeleteEdge:
		broadcastJSON(room, client.ID, Message{
			Type:   "edge_deleted",
			EdgeID: msg.EdgeID,
		})

	case TypeCursorMove:
		broadcastJSON(room, client.ID, Message{
			Type:   TypeCursorUpdate,
			UserID: client.ID,
			X:      msg.X,
			Y:      msg.Y,
		})

	default:
		sendError(client, "Unknown message type: "+msg.Type)
	}
}

func sendRoomState(client *Client, room *Room) {
	room.mu.RLock()
	defer room.mu.RUnlock()

	users := make([]interface{}, 0, len(room.Clients))
	for _, c := range room.Clients {
		if c.ID != client.ID {
			users = append(users, map[string]interface{}{
				"id":   c.ID,
				"name": c.Name,
			})
		}
	}

	msg := Message{
		Type:  TypeRoomState,
		Users: users,
		Locks: room.Locks,
	}

	data, _ := json.Marshal(msg)
	_ = client.Send(data)
}

func broadcastJSON(room *Room, excludeID string, msg Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	room.Broadcast(data, excludeID)
}

func sendError(client *Client, message string) {
	data, _ := json.Marshal(Message{
		Type:        TypeError,
		MessageText: message,
	})
	_ = client.Send(data)
}
