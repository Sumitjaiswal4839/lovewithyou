package api

import (
	"dating-backend/db"
	"dating-backend/ws"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/gorilla/mux"
)

// SetupRoutes registers all REST and WebSocket endpoints
func SetupRoutes(hub *ws.Hub) *mux.Router {
	r := mux.NewRouter()

	// Apply CORS middleware first so every request and preflight gets the right headers.
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			origin := req.Header.Get("Origin")
			allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
			if allowedOrigin == "" {
				allowedOrigin = "*"
			}

			if origin != "" && allowedOrigin != "*" {
				w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			if req.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, req)
		})
	})

	// WebSocket
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWs(hub, w, r)
	})

	// REST API
	r.HandleFunc("/auth/device", DeviceAuth).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/coins/earn", EarnCoins).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/coins/spend", SpendCoins).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/profile/{device_id}", GetProfile).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/profile", UpdateProfile).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/swipes", RecordSwipe).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/users/nearby", GetNearbyClusters).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/users/search", SearchUsers).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/webpush/subscribe", SubscribeWebPush).Methods(http.MethodPost, http.MethodOptions)

	// V1 Campus & Radar Extensions
	r.HandleFunc("/api/v1/sync", SyncState).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/radar/ping", RadarPing).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/campus/crush", SecretCrush).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/campus/confessions", PostConfession).Methods(http.MethodPost, http.MethodOptions)

	// V1 After-Dark 18+ Anonymous Intimate Lounge
	r.HandleFunc("/api/v1/lounge/join", JoinAfterDarkLounge).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/lounge/disconnect", DisconnectAfterDarkLounge).Methods(http.MethodPost, http.MethodOptions)

	// V1 Romance, Discovery & Gamification Suite
	r.HandleFunc("/api/v1/random-chat/join", JoinRandomChat).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/blind-audio/match", BlindAudioMatch).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/haptic/heartbeat", SyncHeartbeat).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/squad/match", SquadDoubleDate).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/swipes/rewind", SecondChanceRewind).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/chat/game/play", TriggerFlirtGame).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/radar/broadcast", PheromoneBroadcast).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/profile/vip-halo", ActivateVipHalo).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/rewards/daily-slot", SpinDailyCupidSlot).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/leaderboard/top-connectors", GetLeaderboardVibeKings).Methods(http.MethodGet, http.MethodOptions)

	// V1 Safety & High-Concurrency Infrastructure
	r.HandleFunc("/api/v1/safety/verify-smile", VerifyFaceCatfishBuster).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/safety/sos-timer", StartSosCheckinTimer).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/safety/sos-confirm", ConfirmSafeCheckin).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/safety/screenshot-violation", ReportScreenshotViolation).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/p2p/webrtc-signal", WebRTCSignalExchange).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/redis/pubsub/publish", RedisPubSubClusterBroadcast).Methods(http.MethodPost, http.MethodOptions)

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

	profile, err := db.GetOrCreateProfile(deviceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "authenticated",
		"device_id": deviceID,
		"coins":     profile.Coins,
	})
}

type CoinRequest struct {
	DeviceID string `json:"device_id"`
	Amount   int    `json:"amount"`
}

func EarnCoins(w http.ResponseWriter, r *http.Request) {
	var req CoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	profile, err := db.UpdateCoins(req.DeviceID, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "coins": profile.Coins})
}

func SpendCoins(w http.ResponseWriter, r *http.Request) {
	var req CoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	profile, err := db.UpdateCoins(req.DeviceID, -req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "coins": profile.Coins})
}

type SwipeRequest struct {
	SwiperID  string `json:"swiper_id"`
	SwipedID  string `json:"swiped_id"`
	Direction string `json:"direction"`
}

func RecordSwipe(w http.ResponseWriter, r *http.Request) {
	var req SwipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	isMatch, err := db.RecordSwipeAndCheckMatch(req.SwiperID, req.SwipedID, req.Direction)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "is_match": isMatch})
}

func GetNearbyClusters(w http.ResponseWriter, r *http.Request) {
	// Parse lat and lng from query string if available
	latStr := r.URL.Query().Get("lat")
	lngStr := r.URL.Query().Get("lng")

	lat, _ := strconv.ParseFloat(latStr, 64)
	lng, _ := strconv.ParseFloat(lngStr, 64)

	clusters, err := db.GetNearbyUsers(lat, lng)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(clusters)
}

func SearchUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		json.NewEncoder(w).Encode([]db.Profile{})
		return
	}

	profiles, err := db.SearchProfiles(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(profiles)
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
