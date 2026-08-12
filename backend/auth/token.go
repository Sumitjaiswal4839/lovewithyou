package auth

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Generate a signed token valid for 30 days
func IssueDeviceToken(deviceID string) (string, error) {
	claims := jwt.MapClaims{
		"sub":       deviceID,
		"device_id": deviceID,
		"role":      "authenticated",
		"exp":       time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("DEVICE_TOKEN_SECRET")))
}

type contextKey string
const DeviceIDKey contextKey = "device_id"

// Middleware to protect routes
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Allow OPTIONS requests to pass through for CORS preflight
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		tokenStr := ""
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			// Fallback to URL query parameter for WebSockets
			tokenStr = r.URL.Query().Get("token")
		}

		if tokenStr == "" {
			http.Error(w, "unauthorized - missing token", http.StatusUnauthorized)
			return
		}
		
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			// Ensure the signing method is exactly what we expect
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(os.Getenv("DEVICE_TOKEN_SECRET")), nil
		}, jwt.WithValidMethods([]string{"HS256"}))
		
		if err != nil || !token.Valid {
			http.Error(w, "unauthorized - invalid token", http.StatusUnauthorized)
			return
		}
		
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "unauthorized - invalid claims", http.StatusUnauthorized)
			return
		}

		deviceID, ok := claims["device_id"].(string)
		if !ok || deviceID == "" {
			http.Error(w, "unauthorized - missing device_id in token", http.StatusUnauthorized)
			return
		}
		
		ctx := context.WithValue(r.Context(), DeviceIDKey, deviceID)
		
		// Pass the request with the verified device_id in the context
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
