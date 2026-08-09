package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

var limiters = struct {
	sync.Mutex
	m map[string]*rate.Limiter
}{m: make(map[string]*rate.Limiter)}

func getLimiter(ip string) *rate.Limiter {
	limiters.Lock()
	defer limiters.Unlock()

	if l, ok := limiters.m[ip]; ok {
		return l
	}
	// 5 requests per second burst limit
	l := rate.NewLimiter(rate.Every(time.Second), 5)
	limiters.m[ip] = l
	return l
}

// RateLimitMiddleware applies a global rate limit per IP
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get IP (simplistic approach, does not handle X-Forwarded-For properly for all setups, but good enough for now)
		ip := strings.Split(r.RemoteAddr, ":")[0]
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			ip = strings.Split(xff, ",")[0]
		}

		if !getLimiter(ip).Allow() {
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
