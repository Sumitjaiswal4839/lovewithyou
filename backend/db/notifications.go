package db

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/supabase-community/postgrest-go"
)

type Notification struct {
	ID              string    `json:"id,omitempty"`
	UserID          string    `json:"user_id"`
	Type            string    `json:"type"`
	Title           string    `json:"title"`
	Message         string    `json:"message"`
	IsRead          bool      `json:"is_read"`
	RelatedEntityID string    `json:"related_entity_id,omitempty"`
	CreatedAt       time.Time `json:"created_at,omitempty"`
}

// CreateNotification inserts a new notification for a user
func CreateNotification(userID, notifType, title, message, relatedEntityID string) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	notif := Notification{
		UserID:          userID,
		Type:            notifType,
		Title:           title,
		Message:         message,
		IsRead:          false,
		RelatedEntityID: relatedEntityID,
	}

	_, _, err := Client.From("notifications").Insert(notif, false, "", "", "").Execute()
	return err
}

// GetUserNotifications fetches notifications for a user, ordered by creation date
func GetUserNotifications(userID string) ([]Notification, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	// Fix for order direction pointer
	data, count, err := Client.From("notifications").Select("*", "exact", false).
		Eq("user_id", userID).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		Limit(50, "").
		Execute()

	if err != nil {
		return nil, err
	}
	_ = count

	var notifications []Notification
	if err := json.Unmarshal(data, &notifications); err != nil {
		return nil, err
	}

	return notifications, nil
}

// MarkNotificationAsRead marks a specific notification as read
func MarkNotificationAsRead(userID, notificationID string) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	_, _, err := Client.From("notifications").Update(map[string]interface{}{"is_read": true}, "", "").
		Eq("id", notificationID).
		Eq("user_id", userID).
		Execute()
	
	return err
}

// MarkAllNotificationsAsRead marks all unread notifications for a user as read
func MarkAllNotificationsAsRead(userID string) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	_, _, err := Client.From("notifications").Update(map[string]interface{}{"is_read": true}, "", "").
		Eq("user_id", userID).
		Eq("is_read", "false").
		Execute()
	
	return err
}
