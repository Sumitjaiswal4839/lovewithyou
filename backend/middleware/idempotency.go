package middleware

import (
	"net/http"
	"sync"
	"time"
)

var seenRequests = struct {
	sync.Mutex
	m map[string]time.Time
}{m: make(map[string]time.Time)}

func IdempotencyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Sirf POST, PUT, DELETE ko deduplicate karna hai
		if r.Method != http.MethodPost && r.Method != http.MethodPut && r.Method != http.MethodDelete {
			next.ServeHTTP(w, r)
			return
		}

		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			// Client ko har action par unique UUID bhejna hoga
			http.Error(w, "X-Request-ID header required to prevent replay attacks", http.StatusBadRequest)
			return
		}

		seenRequests.Lock()
		
		// Memory cleanup: 5 min se purane requests hatao
		for k, v := range seenRequests.m {
			if time.Since(v) > 5*time.Minute {
				delete(seenRequests.m, k)
			}
		}

		// Agar request ID pehle hi process ho chuki hai, toh reject karo
		if _, exists := seenRequests.m[reqID]; exists {
			seenRequests.Unlock()
			http.Error(w, "duplicate request rejected", http.StatusConflict)
			return
		}

		seenRequests.m[reqID] = time.Now()
		seenRequests.Unlock()

		next.ServeHTTP(w, r)
	})
}
