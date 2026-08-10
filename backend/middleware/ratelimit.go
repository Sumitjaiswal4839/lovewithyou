package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"

	"golang.org/x/time/rate"
)

var (
	limiters = make(map[string]*rate.Limiter)
	mu       sync.Mutex
)

// IP nikalne ka secure function
func getClientIP(r *http.Request) string {
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		ips := strings.Split(xff, ",")
		return strings.TrimSpace(ips[0])
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 🔴 NAYA LOGIC: Pehle Device ID dhundo (Header se)
		identifier := r.Header.Get("X-Device-Id")
		
		// Agar Device ID nahi hai (jaise pehli baar login), tabhi IP use karo
		if identifier == "" {
			identifier = getClientIP(r)
		}

		mu.Lock()
		limiter, exists := limiters[identifier]
		if !exists {
			// 5 requests per second, burst of 10
			limiter = rate.NewLimiter(5, 10)
			limiters[identifier] = limiter
		}
		mu.Unlock()

		if !limiter.Allow() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
