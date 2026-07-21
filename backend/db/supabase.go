package db

import (
	"log"
	"os"
	"github.com/supabase-community/supabase-go"
)

var Client *supabase.Client

// InitSupabase connects to Supabase using credentials from .env
func InitSupabase() {
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_SECRET_KEY")

	if url == "" || key == "" {
		log.Fatal("Supabase credentials missing in .env")
	}

	client, err := supabase.NewClient(url, key, nil)
	if err != nil {
		log.Fatalf("Failed to initialize Supabase client: %v", err)
	}
	
	Client = client
	log.Println("✅ Successfully connected to Supabase")
}
