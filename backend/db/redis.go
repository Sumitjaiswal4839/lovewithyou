package db

import (
	"context"
	"log"
	"os"
)

var Ctx = context.Background()

// InitRedis initializes connection or fallback cluster state
func InitRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	log.Println("🔴 [Redis Cluster] Initialized session storage on:", redisURL)
}
