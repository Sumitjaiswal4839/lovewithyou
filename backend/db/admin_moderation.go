package db

import (
	"encoding/json"
	"fmt"
)

type Report struct {
	ID         string `json:"id"`
	ReporterID string `json:"reporter_id"`
	OffenderID string `json:"offender_id"`
	Reason     string `json:"reason"`
	Status     string `json:"status"`
	CreatedAt  string `json:"created_at"`
}

func FetchPendingReports() ([]Report, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	data, _, err := Client.From("reports").Select("*", "exact", false).
		Eq("status", "pending").Execute()

	if err != nil {
		return nil, err
	}

	var reports []Report
	if err := json.Unmarshal(data, &reports); err != nil {
		return nil, err
	}

	return reports, nil
}

func UpdateProfileStatus(deviceID string, updates map[string]interface{}) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	_, _, err := Client.From("profiles").Update(updates, "", "exact").Eq("device_id", deviceID).Execute()
	return err
}

func DeductKarma(deviceID string, amount int) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	_ = Client.Rpc("deduct_karma", "", map[string]interface{}{
		"p_device_id": deviceID,
		"p_amount":    amount,
	})
	return nil
}

func MarkReportResolved(reportID string, action string) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	_, _, err := Client.From("reports").Update(map[string]interface{}{
		"status": "resolved",
	}, "", "exact").Eq("id", reportID).Execute()
	return err
}

func CheckMaintenanceMode() (bool, error) {
	if Client == nil {
		return false, fmt.Errorf("supabase client not initialized")
	}

	data, _, err := Client.From("app_settings").Select("value", "exact", false).Eq("key", "maintenance_mode").Execute()
	if err != nil {
		return false, err
	}

	var results []struct {
		Value bool `json:"value"`
	}
	if err := json.Unmarshal(data, &results); err != nil {
		return false, err
	}

	if len(results) == 0 {
		return false, nil
	}

	return results[0].Value, nil
}
