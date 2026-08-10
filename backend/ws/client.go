package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"dating-backend/auth"
	"dating-backend/db"

	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	RoomID   string
	DeviceID string
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	
	// Allow 5 messages per 200ms burst
	limiter := rate.NewLimiter(rate.Every(200*time.Millisecond), 5) 

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		
		if !limiter.Allow() {
			continue // Silently drop message if rate limited
		}
		
		// 🔴 SECURITY FIX: MESSAGE INJECTION PREVENTION 🔴
		// Overwrite the room_id and device_id with the client's actual authenticated values
		var msgData map[string]interface{}
		if err := json.Unmarshal(message, &msgData); err == nil {
			msgData["room_id"] = c.RoomID
			msgData["device_id"] = c.DeviceID
			if newMsg, err := json.Marshal(msgData); err == nil {
				message = newMsg
			}
		}

		c.hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	deviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok || deviceID == "" {
		// Fallback for query param just in case, though AuthMiddleware handles it
		deviceID = r.URL.Query().Get("device_id")
		if deviceID == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
	}

	roomID := r.URL.Query().Get("room_id")
	if roomID != "" {
		isParticipant, err := db.IsMatchParticipant(deviceID, roomID)
		if err != nil || !isParticipant {
			http.Error(w, "forbidden - not a room participant", http.StatusForbidden)
			return
		}
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), RoomID: roomID, DeviceID: deviceID}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}
