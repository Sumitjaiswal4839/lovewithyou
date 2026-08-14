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

