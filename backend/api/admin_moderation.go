package api

import (
	"encoding/json"
	"net/http"

	"dating-backend/db"
)

// Admin API: Pending reports dekhne ke liye
func GetPendingReports(w http.ResponseWriter, r *http.Request) {
	reports, err := db.FetchPendingReports()
	if err != nil {
		http.Error(w, "Failed to fetch reports", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reports)
}

// Admin API: Action lene ke liye (Ban, Warn, ya Dismiss)
func ResolveReport(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ReportID   string `json:"report_id"`
		OffenderID string `json:"offender_id"`
		Action     string `json:"action"` // "ban", "warn", "deduct_karma", "dismiss"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	switch req.Action {
	case "ban":
		_ = db.UpdateProfileStatus(req.OffenderID, map[string]interface{}{"is_banned": true})
	case "deduct_karma":
		_ = db.DeductKarma(req.OffenderID, 50) // Penalty
	}

	_ = db.MarkReportResolved(req.ReportID, req.Action)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// 4. Get Feature Flags
func GetFeatureFlags(w http.ResponseWriter, r *http.Request) {
	// Default flags returned if DB has no entry yet
	defaultFlags := map[string]interface{}{
		"chat_enabled":           true,
		"radar_enabled":          true,
		"confessions_enabled":    true,
		"after_dark_enabled":     true,
		"coins_purchase_enabled": true,
		"student_verify_enabled": true,
		"maintenance_mode":       false,
	}

	if db.Client == nil {
		// No DB connection — return defaults
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultFlags)
		return
	}

	data, _, err := db.Client.From("site_settings").Select("setting_value", "exact", false).Eq("setting_key", "maintenance_flags").Execute()
	if err != nil {
		// DB error — return defaults
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultFlags)
		return
	}

	var results []struct {
		Value map[string]interface{} `json:"setting_value"`
	}
	if err := json.Unmarshal(data, &results); err != nil || len(results) == 0 {
		// Row not in DB yet — insert defaults and return them
		db.Client.From("site_settings").Insert(map[string]interface{}{
			"setting_key":   "maintenance_flags",
			"setting_value": defaultFlags,
		}, false, "", "", "exact").Execute()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultFlags)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0].Value)
}

// 5. Update Feature Flags
func UpdateFeatureFlags(w http.ResponseWriter, r *http.Request) {
	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if db.Client != nil {
		_, _, err := db.Client.From("site_settings").Update(map[string]interface{}{
			"setting_value": req,
		}, "", "exact").Eq("setting_key", "maintenance_flags").Execute()

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// 3. Toggle Maintenance Mode
func ToggleMaintenanceMode(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Enable bool `json:"enable"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	// Update the app_settings table
	if db.Client != nil {
		_, _, _ = db.Client.From("app_settings").Update(map[string]interface{}{
			"value": req.Enable,
		}, "", "exact").Eq("key", "maintenance_mode").Execute()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "maintenance_mode": req.Enable})
}

