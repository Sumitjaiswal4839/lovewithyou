package middleware

import (
	"net/http"
	"time"

	sentryhttp "github.com/getsentry/sentry-go/http"
)

// SentryMiddleware wraps http handlers to capture panics and report them to Sentry
func SentryMiddleware(next http.Handler) http.Handler {
	sentryHandler := sentryhttp.New(sentryhttp.Options{
		Repanic: true,
		Timeout: 5 * time.Second,
	})

	return sentryHandler.Handle(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// You can add user context to sentry here if you pull it from context
		// e.g. deviceID := r.Context().Value(auth.DeviceIDKey)
		// sentry.ConfigureScope(func(scope *sentry.Scope) { scope.SetUser(sentry.User{ID: deviceID}) })
		
		next.ServeHTTP(w, r)
	}))
}
