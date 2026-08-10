package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var allowedOrigins = map[string]bool{
	"https://lovewithyou.vercel.app": true,
	"http://localhost:3000":          true, // Allow local dev
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return allowedOrigins[origin]
	},
}

// Hub manages active clients and broadcasts messages
type Hub struct {
	clients      map[*Client]bool
	broadcast    chan []byte
	register     chan *Client
	unregister   chan *Client
	seenMessages map[string]time.Time
	mu           sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		broadcast:    make(chan []byte),
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		clients:      make(map[*Client]bool),
		seenMessages: make(map[string]time.Time),
	}
}

func (h *Hub) Run() {
	// 🔴 1. Cleanup ticker lagao (Har 5 minute mein chalega)
	cleanupTicker := time.NewTicker(5 * time.Minute)
	defer cleanupTicker.Stop()

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
				MessageID string `json:"message_id,omitempty"`
				RoomID    string `json:"room_id,omitempty"`
				DeviceID  string `json:"device_id,omitempty"`
				Content   string `json:"content,omitempty"`
			}
			_ = json.Unmarshal(message, &rm)
			
			h.mu.Lock()
			// Duplicate check
			if rm.MessageID != "" {
				if _, exists := h.seenMessages[rm.MessageID]; exists {
					h.mu.Unlock()
					continue // Ignore duplicate message
				}
				h.seenMessages[rm.MessageID] = time.Now()
			}
			h.mu.Unlock()

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

		// 🔴 2. Jab ticker tick kare, map saaf karo
		case <-cleanupTicker.C:
			h.mu.Lock() // Map ko lock karna zaroori hai panic se bachne ke liye
			now := time.Now()
			for msgID, timestamp := range h.seenMessages {
				// Agar message 5 minute se purana hai, toh delete maar do
				if now.Sub(timestamp) > 5*time.Minute {
					delete(h.seenMessages, msgID)
				}
			}
			h.mu.Unlock()
		}
	}
}

// SendToDevice routes a message directly to a specific device's active WebSocket connection
func (h *Hub) SendToDevice(deviceID string, message interface{}) bool {
	h.mu.Lock()
	defer h.mu.Unlock()

	for client := range h.clients {
		if client.DeviceID == deviceID {
			msgBytes, err := json.Marshal(message)
			if err != nil {
				return false
			}
			select {
			case client.send <- msgBytes:
				return true
			default:
				close(client.send)
				delete(h.clients, client)
				return false
			}
		}
	}
	return false
}
