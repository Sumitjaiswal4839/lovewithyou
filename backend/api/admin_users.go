package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"dating-backend/db"
	"github.com/SherClockHolmes/webpush-go"
	"github.com/gorilla/mux"
)

// AdminSearchUser fetches full profile by device_id
func AdminSearchUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	deviceID := vars["device_id"]

	if deviceID == "" {
		http.Error(w, "device_id is required", http.StatusBadRequest)
		return
	}

	profile, err := db.GetProfile(deviceID)
	if err != nil || profile == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

// AdminToggleVIP toggles VIP status for a user
func AdminToggleVIP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		DeviceID string `json:"device_id"`
		IsVIP    bool   `json:"is_vip"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	err := db.UpdateProfileStatus(req.DeviceID, map[string]interface{}{
		"is_vip": req.IsVIP,
	})

	if err != nil {
		http.Error(w, "Failed to update VIP status", http.StatusInternalServerError)
		return
	}

	// Log audit
	if db.Client != nil {
		db.Client.From("admin_audit_logs").Insert(map[string]interface{}{
			"admin_id":  "admin_system", // Since we use sub-admins, ideally extract from context
			"action":    "TOGGLED_VIP",
			"target_id": req.DeviceID,
			"details":   req.IsVIP,
		}, false, "", "", "exact").Execute()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// AdminUpdateUserCoins adds or deducts coins manually
func AdminUpdateUserCoins(w http.ResponseWriter, r *http.Request) {
	var req struct {
		DeviceID string `json:"device_id"`
		Amount   int    `json:"amount"` // Can be negative to deduct
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	_, err := db.UpdateCoinsAtomic(req.DeviceID, req.Amount, "Admin Manual Adjustment")
	if err != nil {
		http.Error(w, "Failed to update coins", http.StatusInternalServerError)
		return
	}

	// Log audit
	if db.Client != nil {
		db.Client.From("admin_audit_logs").Insert(map[string]interface{}{
			"admin_id":  "admin_system",
			"action":    "UPDATED_COINS",
			"target_id": req.DeviceID,
			"details":   req.Amount,
		}, false, "", "", "exact").Execute()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// AdminBroadcastPush sends global push notifications securely
func AdminBroadcastPush(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title   string `json:"title"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.Message == "" {
		req.Message = "A new event is live near you! 💖"
	}
	if req.Title == "" {
		req.Title = "LoveWithYou Update"
	}

	payload, _ := json.Marshal(map[string]string{
		"title": req.Title,
		"body":  req.Message,
	})

	subs := db.GetPushSubscriptions()
	successCount := 0

	vapidPublic := os.Getenv("VAPID_PUBLIC_KEY")
	vapidPrivate := os.Getenv("VAPID_PRIVATE_KEY")

	if vapidPublic == "" || vapidPrivate == "" {
		http.Error(w, "Push keys not configured", http.StatusInternalServerError)
		return
	}

	for _, sub := range subs {
		res, err := webpush.SendNotification(payload, &sub, &webpush.Options{
			Subscriber:      "mailto:admin@dating-pwa.com",
			VAPIDPublicKey:  vapidPublic,
			VAPIDPrivateKey: vapidPrivate,
			TTL:             30,
		})
		if err != nil {
			log.Printf("Push Error: %v", err)
		} else {
			successCount++
			res.Body.Close()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "broadcast_sent",
		"sentCount":        successCount,
		"totalSubscribers": len(subs),
	})
}
