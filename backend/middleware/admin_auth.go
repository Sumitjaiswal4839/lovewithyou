package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func AdminAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow CORS preflight requests to pass through without auth
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		jwtSecret := os.Getenv("JWT_SECRET")
		var tokenString string

		// Method 1: Cookie se token lo (same-origin)
		cookie, err := r.Cookie("admin_session")
		if err == nil {
			tokenString = cookie.Value
		}

		// Method 2: Authorization Bearer header se token lo (cross-origin)
		if tokenString == "" {
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			http.Error(w, "Unauthorized: Admin access required", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, http.ErrAbortHandler
			}
			return []byte(jwtSecret), nil
		}, jwt.WithValidMethods([]string{"HS256"}))

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized: Invalid or expired admin session", http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if claims["role"] != "master_admin" && claims["role"] != "sub_admin" {
				http.Error(w, "Forbidden: Insufficient admin privileges", http.StatusForbidden)
				return
			}
		} else {
			http.Error(w, "Unauthorized: Invalid token claims", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}
