package db

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()
var RedisClient *redis.Client

// InitRedis initializes connection or fallback cluster state
func InitRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr: redisURL,
	})

	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		log.Printf("⚠️ [Redis Cluster] Connection failed (is it running on %s?): %v", redisURL, err)
	} else {
		log.Printf("🔴 [Redis Cluster] Initialized session storage on: %s", redisURL)
	}
}
