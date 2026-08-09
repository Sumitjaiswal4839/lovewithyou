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

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load, reading from environment variables")
	}

	// Initialize Supabase Database
	db.InitSupabase()

	// Initialize WebSocket Hub
	hub := ws.NewHub()
	go hub.Run()

	// Start the SOS Background Cron Worker
	workers.StartSOSMonitor()

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
