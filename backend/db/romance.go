package db

import (
	"encoding/json"
	"sort"
)

func DeductCoins(deviceID string, amount int) error {
	_, err := UpdateCoinsAtomic(deviceID, -amount, "Flirt Game Wager")
	return err
}

func AddCoins(deviceID string, amount int) error {
	_, err := UpdateCoinsAtomic(deviceID, amount, "Flirt Game Winnings")
	return err
}

func GetTopKarmaProfiles(limit int) ([]Profile, error) {
	if Client == nil {
		return nil, nil
	}

	// Fetch specific columns only to prevent data leakage (Fix #14)
	data, _, err := Client.From("profiles").
		Select("name, campus, karma, photo_url", "exact", false).
		Execute()

	if err != nil {
		return nil, err
	}

	var profiles []Profile
	if err := json.Unmarshal(data, &profiles); err != nil {
		return nil, err
	}

	// Sort in memory (descending karma)
	sort.Slice(profiles, func(i, j int) bool {
		return profiles[i].Karma > profiles[j].Karma
	})

	if len(profiles) > limit {
		profiles = profiles[:limit]
	}

	return profiles, nil
}
