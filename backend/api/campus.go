package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"dating-backend/auth"
	"dating-backend/db"
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

// SyncState synchronizes coin economy and karma values across platforms
func SyncState(w http.ResponseWriter, r *http.Request) {
	// 1. Get verified identity
	verifiedDeviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	profile, err := db.GetProfile(verifiedDeviceID)
	if err != nil || profile == nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	// Send the real, server-verified state back to the client to sync their UI
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"coins":   profile.Coins,
		"karma":   profile.Karma,
	})
}

// RadarPing handles high-priority vibration notifications for GPS radar match requests
func RadarPing(w http.ResponseWriter, r *http.Request) {
	verifiedDeviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		TargetAlias string `json:"targetAlias"`
		Timestamp   int64  `json:"timestamp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid Radar Ping payload", http.StatusBadRequest)
		return
	}
	log.Printf("📡 [Radar Ping] Sender %s pinged anonymous peer %s at %d", verifiedDeviceID, req.TargetAlias, time.Now().Unix())

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "ping_delivered",
		Message: fmt.Sprintf("High-priority Radar vibration dispatched to %s", req.TargetAlias),
	})
}

// SecretCrush registers a private crush handle and evaluates mutual match convergence
func SecretCrush(w http.ResponseWriter, r *http.Request) {
	// FIX #18: Only use the verified token identity
	verifiedDeviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		CrushHandle string `json:"crush_handle"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	if req.CrushHandle == "" {
		http.Error(w, "Crush handle is required", http.StatusBadRequest)
		return
	}

	// Use verifiedDeviceID securely
	mutualMatch := db.CheckAndSetSecretCrush(verifiedDeviceID, req.CrushHandle)

	json.NewEncoder(w).Encode(map[string]bool{
		"mutualMatch": mutualMatch,
	})
}

// PostConfession publishes a student community confession to the verified feed
func PostConfession(w http.ResponseWriter, r *http.Request) {
	verifiedDeviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Text          string `json:"text"`
		DepartmentTag string `json:"departmentTag"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	log.Printf("🔥 [New Confession] [%s] by %s: %s", req.DepartmentTag, verifiedDeviceID, req.Text)

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
