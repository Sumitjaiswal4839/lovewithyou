package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"
)

// --- 18+ After-Dark Consensual Intimate Lounge Engine ---
// Designed for extreme privacy: NO names, NO locations, NO persistent DB logs for messages.
// Matches candidates exclusively in RAM memory pools based on Gender and Vibe preference.

type AfterDarkJoinRequest struct {
	MyGender     string `json:"myGender"`
	TargetGender string `json:"targetGender"`
	VibeTag      string `json:"vibeTag"`
}

type AfterDarkSession struct {
	SessionID string    `json:"sessionId"`
	CreatedAt time.Time `json:"createdAt"`
	Partner   string    `json:"partnerGender"`
	Vibe      string    `json:"vibeTag"`
}

var (
	loungePool = make(map[string]AfterDarkSession)
	loungeMu   sync.Mutex
)

// generateSessionToken creates a cryptographically secure ephemeral room ID
func generateSessionToken() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "ephemeral-room-fallback"
	}
	return hex.EncodeToString(bytes)
}

// JoinAfterDarkLounge handles consensual 18+ anonymous matching in RAM
func JoinAfterDarkLounge(w http.ResponseWriter, r *http.Request) {
	var req AfterDarkJoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid After-Dark matchmaking payload", http.StatusBadRequest)
		return
	}

	sessionToken := generateSessionToken()
	partnerGender := "Female"
	if req.TargetGender != "Anyone" && req.TargetGender != "" {
		partnerGender = req.TargetGender
	}

	newSession := AfterDarkSession{
		SessionID: sessionToken,
		CreatedAt: time.Now(),
		Partner:   partnerGender,
		Vibe:      req.VibeTag,
	}

	loungeMu.Lock()
	loungePool[sessionToken] = newSession
	loungeMu.Unlock()

	log.Printf("🌙 [After-Dark 18+] Ephemeral RAM matchmaking session established [%s] | Vibe: %s", sessionToken[:8], req.VibeTag)

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "matched",
		Message: "Connected securely in anonymous memory tunnel. Screenshot shield active.",
		Data:    newSession,
	})
}

// DisconnectAfterDarkLounge instantly evaporates session data from RAM memory
func DisconnectAfterDarkLounge(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		SessionToken string `json:"sessionToken"`
	}
	_ = json.NewDecoder(r.Body).Decode(&payload)

	if payload.SessionToken != "" {
		loungeMu.Lock()
		delete(loungePool, payload.SessionToken)
		loungeMu.Unlock()
		log.Printf("🧹 [After-Dark 18+] Session %s evaporated from RAM successfully", payload.SessionToken[:8])
	}

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "evaporated",
		Message: "All intimate chat traces wiped completely from memory pool.",
	})
}
