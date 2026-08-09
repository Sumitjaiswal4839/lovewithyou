package workers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"dating-backend/db" 
)

type SOSCheckin struct {
	ID               string    `json:"id"`
	DeviceID         string    `json:"device_id"`
	LocationName     string    `json:"location_name"`
	EmergencyContact string    `json:"emergency_contact"` // Treated as Email now
	DueAt            time.Time `json:"due_at"`
}

// StartSOSMonitor starts the background cron job
func StartSOSMonitor() {
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for {
			<-ticker.C
			checkExpiredSOS()
		}
	}()
	log.Println("🛡️ SOS Background Monitor Started...")
}

func checkExpiredSOS() {
	// Query Supabase for active SOS check-ins that have expired
	var expiredCheckins []SOSCheckin

	_, err := db.Client.From("safety_sos_checkins").
		Select("*", "exact", false).
		Eq("status", "active").
		Lte("due_at", time.Now().Format(time.RFC3339)).
		ExecuteTo(&expiredCheckins)

	if err != nil {
		log.Println("Error fetching expired SOS timers:", err)
		return
	}

	for _, sos := range expiredCheckins {
		log.Printf("🚨 SOS ALERT TRIGGERED for Device: %s! Sending Email...", sos.DeviceID)

		// Send the emergency email
		err := sendEmergencyEmail(sos)
		if err == nil {
			// Update status in DB to prevent duplicate emails
			db.Client.From("safety_sos_checkins").
				Update(map[string]interface{}{"status": "alert_sent"}, "", "").
				Eq("id", sos.ID).
				Execute()
		}
	}
}

func sendEmergencyEmail(sos SOSCheckin) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}

	url := "https://api.resend.com/emails"
	htmlContent := fmt.Sprintf(`
		<h2>🚨 EMERGENCY SOS ALERT</h2>
		<p>Your friend has not checked in from their date!</p>
		<p><strong>Last Known Location:</strong> %s</p>
		<p>Please contact them immediately. If unreachable, consider reaching out to local authorities.</p>
	`, sos.LocationName)

	payload := map[string]interface{}{
		"from":    "LoveWithYou Safety <safety@resend.dev>", // Use Resend's test domain for now
		"to":      []string{sos.EmergencyContact}, // User's friend's email
		"subject": "🚨 EMERGENCY SOS: Your Friend Needs Help!",
		"html":    htmlContent,
	}

	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		log.Println("Failed to send Resend email:", err)
		return fmt.Errorf("email failed")
	}
	defer resp.Body.Close()

	log.Printf("✅ Emergency Email Sent to %s", sos.EmergencyContact)
	return nil
}
