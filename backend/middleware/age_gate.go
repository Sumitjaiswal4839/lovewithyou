package middleware

import (
	"net/http"
	"dating-backend/auth"
	"dating-backend/db"
)

func RequireVerifiedAdult(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		deviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		profile, err := db.GetProfile(deviceID)
		if err != nil || profile == nil {
			http.Error(w, "Profile not found", http.StatusNotFound)
			return
		}

		if !profile.Verified || profile.Age < 18 {
			http.Error(w, "Forbidden: 18+ verification required", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	}
}
