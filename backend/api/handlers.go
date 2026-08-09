package api

import (
	"dating-backend/auth"
	"dating-backend/db"
	"dating-backend/middleware"
	"dating-backend/ws"
	"encoding/json"
	"log"
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
	corsOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "https://lovewithyou.vercel.app"
	}

	var allowedOrigins = map[string]bool{
		corsOrigin:              true,
		"http://localhost:3000": true, // Only for dev
	}

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			origin := req.Header.Get("Origin")
			if allowedOrigins[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			
			if req.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, req)
		})
	})

	// Global API Rate Limiting
	r.Use(middleware.RateLimitMiddleware)
	// API Idempotency to prevent Replay Attacks
	r.Use(middleware.IdempotencyMiddleware)

	// WebSocket
	r.HandleFunc("/ws", auth.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWs(hub, w, r)
	}))

	// REST API
	r.HandleFunc("/auth/device", DeviceAuth).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/coins/daily-reward", auth.AuthMiddleware(ClaimDailyReward)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/payments/verify", auth.AuthMiddleware(VerifyRazorpayPayment)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/coins/spend", auth.AuthMiddleware(SpendCoins)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/coins/history/{device_id}", auth.AuthMiddleware(GetCoinHistory)).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/profile/{device_id}", auth.AuthMiddleware(GetProfile)).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/profile", auth.AuthMiddleware(UpdateProfile)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/swipes", auth.AuthMiddleware(RecordSwipe)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/users/nearby", auth.AuthMiddleware(GetNearbyClusters)).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/users/search", auth.AuthMiddleware(SearchUsers)).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/webpush/subscribe", auth.AuthMiddleware(SubscribeWebPush)).Methods(http.MethodPost, http.MethodOptions)

	// V1 Campus & Radar Extensions
	r.HandleFunc("/api/v1/cloudinary/signature", auth.AuthMiddleware(GetUploadSignature)).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/v1/sync", auth.AuthMiddleware(SyncState)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/radar/ping", auth.AuthMiddleware(RadarPing)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/campus/crush", auth.AuthMiddleware(SecretCrush)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/campus/confessions", auth.AuthMiddleware(PostConfession)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/p2p/webrtc-signal", auth.AuthMiddleware(WebRTCSignalExchange(hub))).Methods(http.MethodPost, http.MethodOptions)
	
	// V1 After-Dark 18+ Anonymous Intimate Lounge
	r.HandleFunc("/api/v1/lounge/join", auth.AuthMiddleware(JoinAfterDarkLounge)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/lounge/disconnect", auth.AuthMiddleware(DisconnectAfterDarkLounge)).Methods(http.MethodPost, http.MethodOptions)

	// V1 Romance, Discovery & Gamification Suite
	r.HandleFunc("/api/v1/random-chat/join", auth.AuthMiddleware(JoinRandomChat)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/blind-audio/match", auth.AuthMiddleware(BlindAudioMatch)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/haptic/heartbeat", auth.AuthMiddleware(SyncHeartbeat)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/squad/match", auth.AuthMiddleware(SquadDoubleDate)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/swipes/rewind", auth.AuthMiddleware(SecondChanceRewind)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/chat/game/play", auth.AuthMiddleware(TriggerFlirtGame)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/radar/broadcast", auth.AuthMiddleware(PheromoneBroadcast)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/profile/vip-halo", auth.AuthMiddleware(ActivateVipHalo)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/rewards/daily-slot", auth.AuthMiddleware(SpinDailyCupidSlot)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/leaderboard/top-connectors", auth.AuthMiddleware(GetLeaderboardVibeKings)).Methods(http.MethodGet, http.MethodOptions)

	// V1 Safety & High-Concurrency Infrastructure
	r.HandleFunc("/api/v1/safety/verify-smile", auth.AuthMiddleware(VerifyFaceCatfishBuster)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/safety/sos-timer", auth.AuthMiddleware(StartSosCheckinTimer)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/safety/sos-confirm", auth.AuthMiddleware(ConfirmSafeCheckin)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/safety/screenshot-violation", auth.AuthMiddleware(ReportScreenshotViolation)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/push/broadcast", auth.AuthMiddleware(BroadcastPushNotification)).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/v1/redis/pubsub/publish", auth.AuthMiddleware(RedisPubSubClusterBroadcast)).Methods(http.MethodPost, http.MethodOptions)

	return r
}

func SubscribeWebPush(w http.ResponseWriter, r *http.Request) {
    deviceID := r.Context().Value(auth.DeviceIDKey).(string) // Ensure auth
    var subReq struct {
        DeviceID     string               `json:"device_id"`
        Subscription webpush.Subscription `json:"subscription"`
    }
    if err := json.NewDecoder(r.Body).Decode(&subReq); err != nil {
        http.Error(w, "invalid request body", http.StatusBadRequest)
        return
    }
    
    // Save to Postgres Database instead of memory map
    db.UpsertPushSubscription(deviceID, subReq.Subscription) 
    w.WriteHeader(http.StatusOK)
}

func SendPushNotification(deviceID, message string) {
    // Legacy support, maybe unused if we broadcast
}

// Wrap Broadcast endpoint with Admin Check
func BroadcastPushNotification(w http.ResponseWriter, r *http.Request) {
    deviceID := r.Context().Value(auth.DeviceIDKey).(string)
    
    // Custom logic to verify admin
    if !db.IsAdmin(deviceID) {
        http.Error(w, "forbidden", http.StatusForbidden)
        return
    }
    
    var req struct {
        Title   string `json:"title"`
        Message string `json:"message"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request body", http.StatusBadRequest)
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

    for _, sub := range subs {
        res, err := webpush.SendNotification(payload, &sub, &webpush.Options{
            Subscriber:      "mailto:admin@dating-pwa.com",
            VAPIDPublicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
            VAPIDPrivateKey: os.Getenv("VAPID_PRIVATE_KEY"),
            TTL:             30,
        })
        if err != nil {
            log.Printf("Push Error: %v", err)
        } else {
            successCount++
            res.Body.Close()
        }
    }

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":           "broadcast_sent",
		"sentCount":        successCount,
		"totalSubscribers": len(subs),
	})
}
func DeviceAuth(w http.ResponseWriter, r *http.Request) {
    // 1. Ek struct banate hain jo 'device_id' aur 'deviceId' dono accept karega
    var req struct {
        DeviceID      string `json:"device_id"`
        DeviceIDCamel string `json:"deviceId"` // Frontend ke liye
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request body", http.StatusBadRequest)
        return
    }

    // 2. Dono mein se jo bhi frontend ne bheja hai, usko nikal lo
    finalDeviceID := req.DeviceID
    if finalDeviceID == "" {
        finalDeviceID = req.DeviceIDCamel
    }

    // 3. Agar abhi bhi empty hai, tabhi 400 error do
    if finalDeviceID == "" {
        http.Error(w, "device_id is required", http.StatusBadRequest)
        return
    }

    // 4. Database se profile fetch ya create karo
    profile, err := db.GetOrCreateProfile(finalDeviceID)
    if err != nil {
        log.Printf("Internal error: %v", err)
        http.Error(w, "internal server error", http.StatusInternalServerError)
        return
    }

    // 5. JWT Token Generate karo
    token, err := auth.IssueDeviceToken(finalDeviceID)
    if err != nil {
        http.Error(w, "Failed to issue token", http.StatusInternalServerError)
        return
    }

    // 6. Token aur Profile dono frontend ko return karo
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "authenticated",
		"device_id": finalDeviceID,
		"coins":     profile.Coins,
		"token":     token,
    })
}

type CoinRequest struct {
	DeviceID    string `json:"device_id"`
	Amount      int    `json:"amount"`
	Description string `json:"description,omitempty"`
}

func ClaimDailyReward(w http.ResponseWriter, r *http.Request) {
	deviceID := r.Context().Value(auth.DeviceIDKey).(string)
	const dailyRewardAmount = 10 // Amount is hardcoded server-side

	// In a real app, check cooldown/last claimed time here in DB
	// ...

	_, err := db.UpdateCoinsAtomic(deviceID, dailyRewardAmount, "Daily Reward")
	if err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success", "message": "Claimed 10 coins"}`))
}

func SpendCoins(w http.ResponseWriter, r *http.Request) {
	var req CoinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusBadRequest)
		return
	}

	desc := req.Description
	if desc == "" {
		desc = "Spent Coins"
	}

	deviceID := r.Context().Value(auth.DeviceIDKey).(string)

	_, err := db.UpdateCoinsAtomic(deviceID, -req.Amount, desc)
	if err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	// Return a generic success for spend, actual coins balance can be synced via /profile
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success"})
}

func GetCoinHistory(w http.ResponseWriter, r *http.Request) {
	// Always use authenticated device_id, ignoring path variable
	deviceID := r.Context().Value(auth.DeviceIDKey).(string)

	history, err := db.GetCoinHistory(deviceID)
	if err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

type SwipeRequest struct {
	SwiperID  string `json:"swiper_id"`
	SwipedID  string `json:"swiped_id"`
	Direction string `json:"direction"`
}

func RecordSwipe(w http.ResponseWriter, r *http.Request) {
	var req SwipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusBadRequest)
		return
	}

	swiperID := r.Context().Value(auth.DeviceIDKey).(string)

	isMatch, err := db.RecordSwipeAndCheckMatch(swiperID, req.SwipedID, req.Direction)
	if err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
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
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
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
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(profiles)
}

// Define a safe DTO
type PublicProfileDTO struct {
    DeviceID string `json:"device_id"`
    Name     string `json:"name"`
    Bio      string `json:"bio"`
    Age      int    `json:"age"`
    PhotoURL string `json:"photo_url"`
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
    requestedID := mux.Vars(r)["device_id"]
    authedID := r.Context().Value(auth.DeviceIDKey).(string) // From middleware
    
    profile, err := db.GetProfile(requestedID)
    if err != nil { 
        http.Error(w, "not found", http.StatusNotFound)
        return 
    }
    
    // If it's my own profile, return everything. Else, return sanitized data.
    if requestedID == authedID {
        json.NewEncoder(w).Encode(profile) 
        return
    }
    
    // Create and return DTO
    publicData := PublicProfileDTO{
        DeviceID: profile.DeviceID,
        Name:     profile.Name,
        Bio:      profile.Bio,
        Age:      profile.Age,
        PhotoURL: profile.PhotoURL,
    }
    json.NewEncoder(w).Encode(publicData)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var newProfile db.Profile
	if err := json.NewDecoder(r.Body).Decode(&newProfile); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	deviceID := r.Context().Value(auth.DeviceIDKey).(string)
	newProfile.DeviceID = deviceID // Force ID to match authenticated token

	existing, err := db.GetProfile(newProfile.DeviceID)
	if err == nil && existing != nil {
		// Enforce Rules: Do not allow changing locked/system fields if they already exist
		newProfile.Gender = existing.Gender
		newProfile.Coins = existing.Coins
		newProfile.Verified = existing.Verified
		newProfile.Karma = existing.Karma
		newProfile.IsBanned = existing.IsBanned // Ban state only settable by admin
	} else {
		// New profile defaults
		newProfile.Karma = 100
		newProfile.Coins = 100
		newProfile.Verified = false // Force Verified to false for new users
		newProfile.IsBanned = false // Force IsBanned to false
	}

	updated, err := db.UpsertProfile(newProfile)
	if err != nil {
		log.Printf("Internal error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"profile": updated,
	})
}
