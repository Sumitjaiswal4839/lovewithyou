package main

import (
	"log"
	"net/http"
	"os"

	"dating-backend/api"
	"dating-backend/db"
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

	// Setup API Routes
	router := api.SetupRoutes(hub)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on :%s\n", port)
	err = http.ListenAndServe(":"+port, router)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
