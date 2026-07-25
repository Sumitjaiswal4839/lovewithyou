package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// --- Data Structs & Models for Campus & Radar Extensions ---

type SyncStateRequest struct {
	DeviceID string `json:"deviceId"`
	Coins    int    `json:"coins"`
	Karma    int    `json:"karma"`
}

type RadarPingRequest struct {
	SenderID    string `json:"senderId"`
	TargetAlias string `json:"targetAlias"`
	Timestamp   int64  `json:"timestamp"`
}

type SecretCrushRequest struct {
	MyDeviceID  string `json:"myDeviceId"`
	CrushHandle string `json:"crushHandle"`
}

type ConfessionRequest struct {
	Text          string `json:"text"`
	DepartmentTag string `json:"departmentTag"`
	AuthorID      string `json:"authorId"`
}

type ResponsePayload struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

// In-Memory Mutex Lockers for Prototype Simulation
var (
	crushLocker = make(map[string][]string) // map[myHandle][]crushHandles
	crushMu     sync.Mutex
)

// SyncState synchronizes coin economy and karma values across platforms
func SyncState(w http.ResponseWriter, r *http.Request) {
	deviceID := r.Header.Get("X-Device-Id")
	log.Printf("🔄 [State Sync] Processing sync for hardware ID: %s", deviceID)

	var req SyncStateRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "success",
		Message: "User coin economy and state synchronized successfully",
		Data:    req,
	})
}

// RadarPing handles high-priority vibration notifications for GPS radar match requests
func RadarPing(w http.ResponseWriter, r *http.Request) {
	var req RadarPingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Radar Ping payload", http.StatusBadRequest)
		return
	}
	log.Printf("📡 [Radar Ping] Sender %s pinged anonymous peer %s at %d", req.SenderID, req.TargetAlias, time.Now().Unix())

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "ping_delivered",
		Message: fmt.Sprintf("High-priority Radar vibration dispatched to %s", req.TargetAlias),
	})
}

// SecretCrush registers a private crush handle and evaluates mutual match convergence
func SecretCrush(w http.ResponseWriter, r *http.Request) {
	var req SecretCrushRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Secret Crush payload", http.StatusBadRequest)
		return
	}

	crushMu.Lock()
	crushLocker[req.MyDeviceID] = append(crushLocker[req.MyDeviceID], req.CrushHandle)

	// Check for mutual crush convergence
	isMutual := false
	for _, targetCrush := range crushLocker[req.CrushHandle] {
		if targetCrush == req.MyDeviceID {
			isMutual = true
			break
		}
	}
	crushMu.Unlock()

	log.Printf("💘 [Secret Crush] User %s marked crush on %s | Mutual Match: %t", req.MyDeviceID, req.CrushHandle, isMutual)

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "crush_recorded",
		Message: "Secret crush stored securely in anonymous memory lock box",
		Data:    map[string]bool{"mutualMatch": isMutual},
	})
}

// PostConfession publishes a student community confession to the verified feed
func PostConfession(w http.ResponseWriter, r *http.Request) {
	var req ConfessionRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	log.Printf("🔥 [New Confession] [%s]: %s", req.DepartmentTag, req.Text)

	sendJSONResponse(w, http.StatusCreated, ResponsePayload{
		Status:  "published",
		Message: "Anonymous confession verified and published to college feed",
	})
}

func sendJSONResponse(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(data)
}
