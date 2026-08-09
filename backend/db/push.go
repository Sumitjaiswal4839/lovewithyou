package db

import (
	"encoding/json"
	"log"

	"github.com/SherClockHolmes/webpush-go"
)

func UpsertPushSubscription(deviceID string, sub webpush.Subscription) {
	subJson, _ := json.Marshal(sub)
	_, _, err := Client.From("push_subscriptions").Upsert(map[string]interface{}{
		"device_id": deviceID,
		"subscription_data": string(subJson),
	}, "", "", "exact").Execute()
	
	if err != nil {
		log.Printf("Failed to upsert push subscription for %s: %v", deviceID, err)
	}
}

func GetPushSubscriptions() []webpush.Subscription {
	var results []map[string]interface{}
	_, err := Client.From("push_subscriptions").Select("subscription_data", "exact", false).ExecuteTo(&results)
	if err != nil {
		log.Printf("Failed to get push subscriptions: %v", err)
		return nil
	}

	var subs []webpush.Subscription
	for _, row := range results {
		var sub webpush.Subscription
		subData := row["subscription_data"].(string)
		if err := json.Unmarshal([]byte(subData), &sub); err == nil {
			subs = append(subs, sub)
		}
	}
	return subs
}

func IsAdmin(deviceID string) bool {
    // Basic admin check (could be expanded to check a 'role' column in profiles)
	var results []map[string]interface{}
	_, err := Client.From("profiles").Select("is_admin", "exact", false).Eq("device_id", deviceID).ExecuteTo(&results)
	if err != nil || len(results) == 0 {
		return false
	}
    isAdmin, ok := results[0]["is_admin"].(bool)
    return ok && isAdmin
}
