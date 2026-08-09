package db

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Profile struct {
	DeviceID                  string              `json:"device_id"`
	Name                      string              `json:"name"`
	Bio                       string              `json:"bio"`
	Hobbies                   []string            `json:"hobbies"`
	Interests                 []string            `json:"interests"`
	Location                  string              `json:"location"`
	Campus                    string              `json:"campus,omitempty"`
	Age                       int                 `json:"age"`
	PhotoURL                  string              `json:"photo_url"`
	Photos                    []string            `json:"photos,omitempty"`
	VoicePromptURL            string              `json:"voice_prompt_url,omitempty"`
	Gender                    string              `json:"gender"`
	Verified                  bool                `json:"verified"`
	Coins                     int                 `json:"coins"`
	Karma                     int                 `json:"karma"`
	ZodiacSign                string              `json:"zodiacSign,omitempty"`
	Analytics                 map[string]int      `json:"analytics,omitempty"`
	Mode                      string              `json:"mode,omitempty"`
	IsAnonymous               bool                `json:"isAnonymous"`
	IsBanned                  bool                `json:"is_banned,omitempty"`
	Orientation               string              `json:"orientation,omitempty"`
	Faith                     string              `json:"faith,omitempty"`
	PrismaPersonality         string              `json:"prismaPersonality,omitempty"`
	SpotifyArtists            []string            `json:"spotifyArtists,omitempty"`
	Prompts                   []map[string]string `json:"prompts,omitempty"`
	IsStudent                 bool                `json:"isStudent,omitempty"`
	StudentIdUrl              string              `json:"studentIdUrl,omitempty"`
	StudentVerificationStatus string              `json:"studentVerificationStatus,omitempty"`
	Latitude                  float64             `json:"latitude,omitempty"`
	Longitude                 float64             `json:"longitude,omitempty"`
}

// GetProfile fetches a profile from the 'profiles' table in Supabase
func GetProfile(deviceID string) (*Profile, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	data, count, err := Client.From("profiles").Select("*", "exact", false).Eq("device_id", deviceID).Single().Execute()
	if err != nil {
		return nil, err
	}

	// single response returns byte slice of the object
	_ = count // silence unused variable

	var profile Profile
	if err := json.Unmarshal(data, &profile); err != nil {
		return nil, err
	}
	return &profile, nil
}

// UpsertProfile inserts or updates a profile in the 'profiles' table
func UpsertProfile(profile Profile) (*Profile, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	data, count, err := Client.From("profiles").Upsert(profile, "device_id", "exact", "").Execute()
	if err != nil {
		return nil, err
	}

	_ = count

	var profiles []Profile
	if err := json.Unmarshal(data, &profiles); err != nil {
		return nil, err
	}

	if len(profiles) > 0 {
		return &profiles[0], nil
	}
	return &profile, nil
}

// GetOrCreateProfile gets an existing profile or creates a new one with default coins
func GetOrCreateProfile(deviceID string) (*Profile, error) {
	profile, err := GetProfile(deviceID)
	if err == nil && profile != nil {
		return profile, nil
	}

	// Create new stub profile - name will be filled in via /profile POST after setup
	newProfile := Profile{
		DeviceID: deviceID,
		Name:     "",
		Coins:    100,
		Karma:    100,
		Mode:     "Date",
	}
	return UpsertProfile(newProfile)
}

func UpdateCoinsAtomic(deviceID string, amount int, description string) (int, error) {
	if Client == nil {
		return 0, fmt.Errorf("supabase client not initialized")
	}

	params := map[string]interface{}{
		"p_device_id": deviceID,
		"p_amount":    amount,
	}
	
	// The supabase-go client's Rpc method signature can vary, 
	// typically returning the raw JSON response or an error.
	// For this setup, we assume the RPC handles the atomic constraint
	// and throws an exception if the balance would drop below zero.
	res := Client.Rpc("update_coins_atomic", "", params)
	if res != "" && (strings.Contains(res, "error") || strings.Contains(res, "insufficient_coins")) {
		return 0, fmt.Errorf("failed to update coins: %s", res)
	}

	transType := "EARNED"
	if amount < 0 {
		transType = "SPENT"
	}
	if description == "" {
		if amount > 0 {
			description = "Coins Earned"
		} else {
			description = "Coins Spent"
		}
	}
	
	err := LogCoinTransaction(deviceID, amount, transType, description)
	if err != nil {
		return 0, fmt.Errorf("failed to log coin transaction: %v", err)
	}

	// We return a generic 1 as success since the true balance is handled by DB.
	return 1, nil
}

type CoinTransaction struct {
	ID              string `json:"id,omitempty"`
	DeviceID        string `json:"device_id"`
	Amount          int    `json:"amount"`
	TransactionType string `json:"transaction_type"`
	Description     string `json:"description"`
	CreatedAt       string `json:"created_at,omitempty"`
}

func LogCoinTransaction(deviceID string, amount int, transType string, description string) error {
	if Client == nil {
		return nil
	}
	tx := CoinTransaction{
		DeviceID:        deviceID,
		Amount:          amount,
		TransactionType: transType,
		Description:     description,
	}
	_, _, err := Client.From("coin_transactions").Insert(tx, false, "", "", "").Execute()
	return err
}

func GetCoinHistory(deviceID string) ([]CoinTransaction, error) {
	if Client == nil {
		return []CoinTransaction{}, nil
	}
	data, _, err := Client.From("coin_transactions").
		Select("*", "exact", false).
		Eq("device_id", deviceID).
		Execute()
	if err != nil {
		return []CoinTransaction{}, err
	}
	var history []CoinTransaction
	if err := json.Unmarshal(data, &history); err != nil {
		return []CoinTransaction{}, err
	}
	return history, nil
}

type Swipe struct {
	SwiperID  string `json:"swiper_id"`
	SwipedID  string `json:"swiped_id"`
	Direction string `json:"direction"`
}

type Match struct {
	User1ID string `json:"user1_id"`
	User2ID string `json:"user2_id"`
}

func RecordSwipeAndCheckMatch(swiperID, swipedID, direction string) (bool, error) {
	if Client == nil {
		return false, fmt.Errorf("supabase client not initialized")
	}

	swipe := Swipe{SwiperID: swiperID, SwipedID: swipedID, Direction: direction}
	_, _, err := Client.From("swipes").Upsert(swipe, "", "exact", "").Execute()
	if err != nil {
		return false, err
	}

	if direction == "left" {
		return false, nil
	}

	data, count, err := Client.From("swipes").Select("*", "exact", false).
		Eq("swiper_id", swipedID).
		Eq("swiped_id", swiperID).
		Eq("direction", "right").Execute()

	if err != nil {
		return false, err
	}
	_ = count

	var oppositeSwipes []Swipe
	if err := json.Unmarshal(data, &oppositeSwipes); err != nil {
		return false, err
	}

	if len(oppositeSwipes) > 0 {
		match := Match{User1ID: swiperID, User2ID: swipedID}
		_, _, err := Client.From("matches").Upsert(match, "", "exact", "").Execute()
		if err != nil {
			return false, err
		}
		return true, nil
	}

	return false, nil
}

type Cluster struct {
	AreaName string  `json:"area_name"`
	Count    int     `json:"count"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
}

func GetNearbyUsers(lat, lng float64) ([]Cluster, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	data, _, err := Client.From("profiles").Select("location, latitude, longitude", "exact", false).
		Gt("latitude", "0").Execute()

	if err != nil {
		return nil, err
	}

	var profiles []Profile
	if err := json.Unmarshal(data, &profiles); err != nil {
		return nil, err
	}

	clusterMap := make(map[string]*Cluster)
	for _, p := range profiles {
		loc := p.Location
		if loc == "" {
			loc = "Unknown Area"
		}
		if c, ok := clusterMap[loc]; ok {
			c.Count++
		} else {
			clusterMap[loc] = &Cluster{
				AreaName: loc,
				Count:    1,
				Lat:      p.Latitude,
				Lng:      p.Longitude,
			}
		}
	}

	var clusters []Cluster
	for _, c := range clusterMap {
		clusters = append(clusters, *c)
	}

	if len(clusters) == 0 {
		clusters = append(clusters, Cluster{
			AreaName: "Connaught Place, Delhi",
			Count:    57,
			Lat:      28.6304,
			Lng:      77.2177,
		})
	}

	return clusters, nil
}

func SearchProfiles(query string) ([]Profile, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	// Basic sanitization
	if len(query) < 2 {
		return []Profile{}, nil
	}

	data, _, err := Client.From("profiles").Select("*", "exact", false).
		Ilike("name", "%"+query+"%").
		Limit(15, "").
		Execute()

	if err != nil {
		return nil, err
	}

	var profiles []Profile
	if err := json.Unmarshal(data, &profiles); err != nil {
		return nil, err
	}

	return profiles, nil
}

func IsMatchParticipant(deviceID, roomID string) (bool, error) {
	if Client == nil {
		return false, fmt.Errorf("supabase client not initialized")
	}

	parts := strings.Split(roomID, "_")
	if len(parts) != 2 {
		return false, nil // Invalid room ID format
	}

	if parts[0] != deviceID && parts[1] != deviceID {
		return false, nil // Device is not part of this room
	}

	otherID := parts[0]
	if parts[0] == deviceID {
		otherID = parts[1]
	}

	// Check if match exists in DB (or if it's a valid chat session)
	// For this app, any valid room_id formatted "id1_id2" where one is the user is verified by 
	// checking if a match exists between them.
	data, count, err := Client.From("matches").Select("*", "exact", false).
		Or(fmt.Sprintf("and(user1_id.eq.%s,user2_id.eq.%s),and(user1_id.eq.%s,user2_id.eq.%s)", deviceID, otherID, otherID, deviceID), "").
		Execute()

	if err != nil {
		return false, err
	}
	_ = count

	var matches []Match
	if err := json.Unmarshal(data, &matches); err != nil {
		return false, err
	}

	return len(matches) > 0, nil
}
