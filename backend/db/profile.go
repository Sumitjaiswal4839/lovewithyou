package db

import (
	"encoding/json"
	"fmt"
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
	VoicePromptURL            string              `json:"voice_prompt_url,omitempty"`
	Gender                    string              `json:"gender"`
	Verified                  bool                `json:"verified"`
	Coins                     int                 `json:"coins"`
	Karma                     int                 `json:"karma"`
	ZodiacSign                string              `json:"zodiacSign,omitempty"`
	Analytics                 map[string]int      `json:"analytics,omitempty"`
	Mode                      string              `json:"mode,omitempty"`
	IsAnonymous               bool                `json:"isAnonymous"`
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

	data, count, err := Client.From("profiles").Upsert(profile, "", "exact", "").Execute()
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

	// Create new profile if not found
	newProfile := Profile{
		DeviceID: deviceID,
		Coins:    100, // Starting coins
		Karma:    100,
	}
	return UpsertProfile(newProfile)
}

// UpdateCoins adds or subtracts coins from a profile securely
func UpdateCoins(deviceID string, amount int) (*Profile, error) {
	profile, err := GetProfile(deviceID)
	if err != nil {
		return nil, err
	}

	newBalance := profile.Coins + amount
	if newBalance < 0 {
		return nil, fmt.Errorf("insufficient coins")
	}

	profile.Coins = newBalance
	return UpsertProfile(*profile)
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
