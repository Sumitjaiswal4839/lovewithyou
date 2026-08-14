package middleware

import (
	"encoding/json"
	"net/http"
	"dating-backend/db"
)

func MaintenanceMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip maintenance check for admin routes
		if len(r.URL.Path) >= 13 && r.URL.Path[:13] == "/api/v1/admin" {
			next.ServeHTTP(w, r)
			return
		}

		isMaintenance, _ := db.CheckMaintenanceMode()
		if isMaintenance {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{
				"error":  "App is currently under maintenance. Please try again later.",
				"status": "maintenance_mode",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}
