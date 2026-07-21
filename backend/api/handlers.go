package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"dating-backend/db"
	"dating-backend/ws"

	"github.com/gorilla/mux"
	"github.com/SherClockHolmes/webpush-go"
)

// SetupRoutes registers all REST and WebSocket endpoints
func SetupRoutes(hub *ws.Hub) *mux.Router {
	r := mux.NewRouter()
	
	// WebSocket
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWs(hub, w, r)
	})

	// REST API
	r.HandleFunc("/auth/device", DeviceAuth).Methods("POST")
	r.HandleFunc("/coins/earn", EarnCoins).Methods("POST")
	r.HandleFunc("/coins/spend", SpendCoins).Methods("POST")
	r.HandleFunc("/profile/{device_id}", GetProfile).Methods("GET")
	r.HandleFunc("/profile", UpdateProfile).Methods("POST")
	r.HandleFunc("/webpush/subscribe", SubscribeWebPush).Methods("POST")
	return r
}

var pushSubscriptions = make(map[string]*webpush.Subscription)

func SubscribeWebPush(w http.ResponseWriter, r *http.Request) {
	var subReq struct {
		DeviceID     string               `json:"device_id"`
		Subscription webpush.Subscription `json:"subscription"`
	}
	if err := json.NewDecoder(r.Body).Decode(&subReq); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	pushSubscriptions[subReq.DeviceID] = &subReq.Subscription
	json.NewEncoder(w).Encode(map[string]string{"status": "subscribed"})
}

func SendPushNotification(deviceID, message string) {
	sub, exists := pushSubscriptions[deviceID]
	if !exists {
		return
	}

	res, err := webpush.SendNotification([]byte(message), sub, &webpush.Options{
		Subscriber:      "mailto:admin@dating-pwa.com",
		VAPIDPublicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
		VAPIDPrivateKey: os.Getenv("VAPID_PRIVATE_KEY"),
		TTL:             30,
	})
	if err != nil {
		fmt.Println("Push Error:", err)
	}
	defer res.Body.Close()
}

func DeviceAuth(w http.ResponseWriter, r *http.Request) {
	var req map[string]string
	json.NewDecoder(r.Body).Decode(&req)
	deviceID := req["device_id"]
	json.NewEncoder(w).Encode(map[string]string{"status": "authenticated", "device_id": deviceID})
}

func EarnCoins(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "coins added"})
}

func SpendCoins(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "coins spent"})
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	deviceID := vars["device_id"]

	profile, err := db.GetProfile(deviceID)
	if err != nil {
		http.Error(w, "Profile not found or error: "+err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(profile)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var newProfile db.Profile
	json.NewDecoder(r.Body).Decode(&newProfile)

	existing, err := db.GetProfile(newProfile.DeviceID)
	if err == nil && existing != nil {
		// Enforce Rules: Do not allow changing locked/system fields if they already exist
		newProfile.Gender = existing.Gender
		newProfile.Coins = existing.Coins
		newProfile.Verified = existing.Verified
		newProfile.Karma = existing.Karma
	} else {
		// New profile defaults
		newProfile.Karma = 100
		newProfile.Coins = 100
	}

	updated, err := db.UpsertProfile(newProfile)
	if err != nil {
		http.Error(w, "Failed to update profile: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"profile": updated,
	})
}
