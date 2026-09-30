package db

import (
	"encoding/json"
	"fmt"
	"time"
)

// ============================================================
// BLIND AUDIO SESSIONS (blind_audio_sessions table)
// ============================================================

type BlindAudioSessionRecord struct {
	ID          string    `json:"id"`
	CallerID    string    `json:"caller_id"`
	ReceiverID  string    `json:"receiver_id"`
	CallerYes   bool      `json:"caller_yes"`
	ReceiverYes bool      `json:"receiver_yes"`
	StartedAt   time.Time `json:"started_at"`
}

// SaveBlindAudioSession persists a matched blind audio session to the database
func SaveBlindAudioSession(callerID, receiverID string) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}
	_, _, err := Client.From("blind_audio_sessions").Insert(map[string]interface{}{
		"caller_id":   callerID,
		"receiver_id": receiverID,
		"caller_yes":  false,
		"receiver_yes": false,
	}, false, "", "", "").Execute()
	return err
}

// ============================================================
// DOUBLE DATE SQUADS (double_date_squads table)
// ============================================================

type DoubleDateSquadRecord struct {
	RoomID     string    `json:"room_id"`
	SquadName  string    `json:"squad_name"`
	Member1    string    `json:"member_1"`
	Member2    string    `json:"member_2"`
	VibeTopic  string    `json:"vibe_topic"`
	CreatedAt  time.Time `json:"created_at"`
}

// SaveSquadMatch persists a matched 2v2 squad room to the database
func SaveSquadMatch(roomID, squadName, leader1, leader2 string) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}
	_, _, err := Client.From("double_date_squads").Insert(map[string]interface{}{
		"room_id":    roomID,
		"squad_name": squadName,
		"member_1":   leader1,
		"member_2":   leader2,
		"vibe_topic": "Late Night Fun",
	}, false, "", "", "").Execute()
	return err
}

// GetSquadByRoom retrieves a persisted squad room from DB
func GetSquadByRoom(roomID string) (*DoubleDateSquadRecord, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}
	data, _, err := Client.From("double_date_squads").Select("*", "exact", false).Eq("room_id", roomID).Execute()
	if err != nil {
		return nil, err
	}
	var squads []DoubleDateSquadRecord
	if err := json.Unmarshal(data, &squads); err != nil {
		return nil, err
	}
	if len(squads) == 0 {
		return nil, nil
	}
	return &squads[0], nil
}

// ============================================================
// AFTER DARK SESSIONS (anonymous_after_dark_sessions table)
// ============================================================

type AfterDarkSessionRecord struct {
	SessionID     string    `json:"session_id"`
	VibeTag       string    `json:"vibe_tag"`
	MatchedGender string    `json:"matched_gender"`
	CreatedAt     time.Time `json:"created_at"`
	ExpiresAt     time.Time `json:"expires_at"`
}

// SaveAfterDarkSession persists matched anonymous session metadata to DB (no PII)
func SaveAfterDarkSession(sessionID, vibeTag, matchedGender string, expiresAt time.Time) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}
	_, _, err := Client.From("anonymous_after_dark_sessions").Insert(map[string]interface{}{
		"session_id":     sessionID,
		"vibe_tag":       vibeTag,
		"matched_gender": matchedGender,
		"expires_at":     expiresAt.Format(time.RFC3339),
	}, false, "", "", "").Execute()
	return err
}

// CleanupExpiredAfterDarkSessions removes sessions past their expiry time
func CleanupExpiredAfterDarkSessions() error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}
	now := time.Now().Format(time.RFC3339)
	_, _, err := Client.From("anonymous_after_dark_sessions").Delete("", "").Lt("expires_at", now).Execute()
	return err
}
