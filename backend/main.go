package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"dating-backend/api"
	"dating-backend/db"
	"dating-backend/workers"
	"dating-backend/ws"
	_ "dating-backend/docs"

	"github.com/joho/godotenv"
	"github.com/getsentry/sentry-go"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load, reading from environment variables")
	}

	// Initialize Sentry
	err = sentry.Init(sentry.ClientOptions{
		Dsn:              os.Getenv("SENTRY_DSN"),
		TracesSampleRate: 1.0,
	})
	if err != nil {
		log.Printf("Sentry initialization failed: %v\n", err)
	}
	// Flush buffered events before the program terminates
	defer sentry.Flush(2 * time.Second)

	// Initialize Supabase Database
	db.InitSupabase()
	
	// Initialize Redis
	db.InitRedis()

	// Initialize WebSocket Hub
	hub := ws.NewHub()
	go hub.Run()

	// Start the SOS Background Cron Worker
	workers.StartSOSMonitor()

	// Start After Dark Session Cleanup Worker (runs every hour)
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := db.CleanupExpiredAfterDarkSessions(); err != nil {
				log.Printf("⚠️ [AfterDark Cleanup] Failed to purge expired sessions: %v", err)
			} else {
				log.Println("🧹 [AfterDark Cleanup] Expired anonymous sessions purged from DB.")
			}
		}
	}()

	// Setup API Routes
	router := api.SetupRoutes(hub)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on :%s\n", port)
	
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	
	err = srv.ListenAndServe()
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
