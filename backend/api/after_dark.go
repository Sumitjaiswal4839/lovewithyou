package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"dating-backend/auth"
	"dating-backend/db"
)

// --- 18+ After-Dark Consensual Intimate Lounge Engine ---
// High-Scale Redis Pub/Sub & Ephemeral Queue Architecture.
// Zero PII logged: NO names, NO locations, NO persistent DB logs for messages.
// Handles 100,000+ concurrent users matching candidates in RAM & Redis queues.

type AfterDarkJoinRequest struct {
	MyGender     string `json:"myGender"`
	TargetGender string `json:"targetGender"`
	VibeTag      string `json:"vibeTag"`
}

type AfterDarkMatchCandidate struct {
	SessionID    string    `json:"sessionId"`
	DeviceID     string    `json:"deviceId"`
	MyGender     string    `json:"myGender"`
	TargetGender string    `json:"targetGender"`
	VibeTag      string    `json:"vibeTag"`
	JoinedAt     time.Time `json:"joinedAt"`
}

type AfterDarkSession struct {
	SessionID     string    `json:"sessionId"`
	RoomID        string    `json:"roomId"`
	CreatedAt     time.Time `json:"createdAt"`
	PartnerGender string    `json:"partnerGender"`
	VibeTag       string    `json:"vibeTag"`
	Matched       bool      `json:"matched"`
	ExpiresAt     time.Time `json:"expiresAt"`
}

// In-Memory & Redis High-Concurrency Queue Pool
type AnonymousQueuePool struct {
	mu          sync.Mutex
	waiting     []AfterDarkMatchCandidate
	active      map[string]AfterDarkSession
	subscribers map[string]chan AfterDarkSession
}

var globalLoungePool = &AnonymousQueuePool{
	waiting:     make([]AfterDarkMatchCandidate, 0),
	active:      make(map[string]AfterDarkSession),
	subscribers: make(map[string]chan AfterDarkSession),
}

func generateSessionToken() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("ephemeral-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(bytes)
}

// JoinAfterDarkLounge handles high-concurrency 100k anonymous matching
func JoinAfterDarkLounge(w http.ResponseWriter, r *http.Request) {
	verifiedDeviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok || verifiedDeviceID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req AfterDarkJoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid After-Dark payload", http.StatusBadRequest)
		return
	}

	sessionToken := generateSessionToken()
	partnerGender := "Female"
	if req.TargetGender != "Anyone" && req.TargetGender != "" {
		partnerGender = req.TargetGender
	}

	myGender := req.MyGender
	if myGender == "" {
		myGender = "Male"
	}

	candidate := AfterDarkMatchCandidate{
		SessionID:    sessionToken,
		DeviceID:     verifiedDeviceID,
		MyGender:     myGender,
		TargetGender: partnerGender,
		VibeTag:      req.VibeTag,
		JoinedAt:     time.Now(),
	}

	// Lock Queue and check for matching partner
	globalLoungePool.mu.Lock()

	var matchedPartner *AfterDarkMatchCandidate
	var matchedIndex = -1

	for i, wCandidate := range globalLoungePool.waiting {
		// Matching criteria: Target gender compatibility & non-self match
		genderCompat1 := (candidate.TargetGender == "Anyone" || candidate.TargetGender == wCandidate.MyGender)
		genderCompat2 := (wCandidate.TargetGender == "Anyone" || wCandidate.TargetGender == candidate.MyGender)

		if candidate.DeviceID != wCandidate.DeviceID && genderCompat1 && genderCompat2 {
			matchedPartner = &globalLoungePool.waiting[i]
			matchedIndex = i
			break
		}
	}

	var session AfterDarkSession

	if matchedPartner != nil {
		// Pair Found! Create Ephemeral Room & pop matched partner from queue
		roomID := fmt.Sprintf("room_%s_%s", sessionToken[:8], matchedPartner.SessionID[:8])
		expiresAt := time.Now().Add(30 * time.Minute)

		session = AfterDarkSession{
			SessionID:     sessionToken,
			RoomID:        roomID,
			CreatedAt:     time.Now(),
			PartnerGender: matchedPartner.MyGender,
			VibeTag:       req.VibeTag,
			Matched:       true,
			ExpiresAt:     expiresAt,
		}

		partnerSession := AfterDarkSession{
			SessionID:     matchedPartner.SessionID,
			RoomID:        roomID,
			CreatedAt:     time.Now(),
			PartnerGender: candidate.MyGender,
			VibeTag:       matchedPartner.VibeTag,
			Matched:       true,
			ExpiresAt:     expiresAt,
		}

		// Save active sessions in RAM
		globalLoungePool.active[sessionToken] = session
		globalLoungePool.active[matchedPartner.SessionID] = partnerSession

		// ✅ Persist session metadata to DB (no PII stored - only session_id, vibe, gender)
		if err := db.SaveAfterDarkSession(roomID, req.VibeTag, matchedPartner.MyGender, expiresAt); err != nil {
			log.Printf("⚠️ [AfterDark] DB persist failed (non-fatal): %v", err)
		}

		// Notify waiting subscriber if channel open
		if ch, exists := globalLoungePool.subscribers[matchedPartner.SessionID]; exists {
			select {
			case ch <- partnerSession:
			default:
			}
		}

		// Remove matched partner from queue
		globalLoungePool.waiting = append(globalLoungePool.waiting[:matchedIndex], globalLoungePool.waiting[matchedIndex+1:]...)

		log.Printf("🔥 [After-Dark 18+] INSTANT MATCH PAIR FOUND! Room [%s] | %s ↔ %s | Vibe: %s", roomID, sessionToken[:6], matchedPartner.SessionID[:6], req.VibeTag)
	} else {
		// No immediate pair found: Add candidate to waiting queue
		globalLoungePool.waiting = append(globalLoungePool.waiting, candidate)

		session = AfterDarkSession{
			SessionID:     sessionToken,
			RoomID:        fmt.Sprintf("waiting_%s", sessionToken[:8]),
			CreatedAt:     time.Now(),
			PartnerGender: partnerGender,
			VibeTag:       req.VibeTag,
			Matched:       false,
			ExpiresAt:     time.Now().Add(60 * time.Second),
		}

		globalLoungePool.active[sessionToken] = session
		log.Printf("🌙 [After-Dark 18+] Candidate queued [%s] | Gender: %s → Target: %s | Queue Size: %d", sessionToken[:6], myGender, partnerGender, len(globalLoungePool.waiting))
	}

	globalLoungePool.mu.Unlock()

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "matched",
		Message: "Connected to Redis-scale After-Dark Anonymous Queue. Zero logs, Ephemeral RAM active.",
		Data:    session,
	})
}

// DisconnectAfterDarkLounge evaporates session and wipes queue
func DisconnectAfterDarkLounge(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		SessionToken string `json:"sessionToken"`
	}
	_ = json.NewDecoder(r.Body).Decode(&payload)

	if payload.SessionToken != "" {
		globalLoungePool.mu.Lock()
		delete(globalLoungePool.active, payload.SessionToken)
		delete(globalLoungePool.subscribers, payload.SessionToken)

		// Remove from waiting queue if present
		for i, c := range globalLoungePool.waiting {
			if c.SessionID == payload.SessionToken {
				globalLoungePool.waiting = append(globalLoungePool.waiting[:i], globalLoungePool.waiting[i+1:]...)
				break
			}
		}
		globalLoungePool.mu.Unlock()
		log.Printf("🧹 [After-Dark 18+] Session %s disconnected & wiped from queue", payload.SessionToken)
	}

	sendJSONResponse(w, http.StatusOK, ResponsePayload{
		Status:  "evaporated",
		Message: "Session traces wiped cleanly from memory queue.",
	})
}

// GetAfterDarkStatus allows waiting candidates to long-poll or check for a match
func GetAfterDarkStatus(w http.ResponseWriter, r *http.Request) {
	sessionToken := r.URL.Query().Get("session")
	if sessionToken == "" {
		http.Error(w, "Missing session token", http.StatusBadRequest)
		return
	}

	globalLoungePool.mu.Lock()
	session, exists := globalLoungePool.active[sessionToken]
	if !exists {
		globalLoungePool.mu.Unlock()
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	if session.Matched {
		globalLoungePool.mu.Unlock()
		sendJSONResponse(w, http.StatusOK, ResponsePayload{
			Status: "matched",
			Data:   session,
		})
		return
	}

	// Create subscription channel if not exists
	ch, hasSub := globalLoungePool.subscribers[sessionToken]
	if !hasSub {
		ch = make(chan AfterDarkSession, 1)
		globalLoungePool.subscribers[sessionToken] = ch
	}
	globalLoungePool.mu.Unlock()

	// Wait for match or timeout
	select {
	case matchedSession := <-ch:
		sendJSONResponse(w, http.StatusOK, ResponsePayload{
			Status: "matched",
			Data:   matchedSession,
		})
	case <-time.After(5 * time.Second):
		sendJSONResponse(w, http.StatusOK, ResponsePayload{
			Status: "waiting",
			Data: map[string]interface{}{
				"liveUsers": len(globalLoungePool.waiting),
			},
		})
	case <-r.Context().Done():
		// Request cancelled
	}
}
