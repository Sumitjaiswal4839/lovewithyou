package db

import (
	"encoding/json"
	"fmt"
)

type Profile struct {
	DeviceID       string   `json:"device_id"`
	Name           string   `json:"name"`
	Bio            string   `json:"bio"`
	Hobbies        []string `json:"hobbies"`
	Interests      []string `json:"interests"`
	Location       string   `json:"location"`
	Campus         string   `json:"campus"`
	Age            int      `json:"age"`
	PhotoURL       string   `json:"photo_url"`
	VoicePromptURL string   `json:"voice_prompt_url"`
	Gender         string   `json:"gender"`
	Verified       bool     `json:"verified"`
	Coins          int      `json:"coins"`
	Karma          int      `json:"karma"`
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
