package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev
	},
}

// Hub manages active clients and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			
			// Broadcast new active user count
			countMsg := map[string]interface{}{
				"type": "active_users",
				"count": len(h.clients),
			}
			countBytes, _ := json.Marshal(countMsg)
			for c := range h.clients {
				c.send <- countBytes
			}
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				
				// Broadcast updated active user count
				countMsg := map[string]interface{}{
					"type": "active_users",
					"count": len(h.clients),
				}
				countBytes, _ := json.Marshal(countMsg)
				for c := range h.clients {
					c.send <- countBytes
				}
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			var rm struct {
				RoomID   string `json:"room_id,omitempty"`
				DeviceID string `json:"device_id,omitempty"`
				Content  string `json:"content,omitempty"`
			}
			_ = json.Unmarshal(message, &rm)

			// Basic Toxicity AI Filter Mock
			msgStr := string(message)
			if strings.Contains(strings.ToLower(msgStr), "stupid") || strings.Contains(strings.ToLower(msgStr), "idiot") {
				// We inject a toxicity warning
				warningMsg := map[string]string{
					"type": "system",
					"content": "⚠️ Toxicity Filter: Please keep the conversation respectful.",
				}
				warnBytes, _ := json.Marshal(warningMsg)
				
				log.Println("⚠️ Toxicity Filter Triggered:", msgStr)
				
				h.mu.Lock()
				for client := range h.clients {
					if rm.RoomID == "" || client.RoomID == rm.RoomID {
						client.send <- warnBytes
					}
				}
				h.mu.Unlock()
				continue
			}

			h.mu.Lock()
			for client := range h.clients {
				// Room-based routing: If room_id is specified in message or client, only route within that room
				if rm.RoomID != "" {
					if client.RoomID != rm.RoomID {
						continue
					}
				} else if client.RoomID != "" {
					// Client is in a private room, skip global broadcasts
					continue
				}

				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}
