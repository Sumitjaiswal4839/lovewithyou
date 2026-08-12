package db

import "log"

func VerifyUsersSharedRoom(reporterID, offenderID, roomID string) bool {
	// In a real app, query Supabase to check if both users were in roomID recently.
	return roomID != "" && offenderID != ""
}

func LogViolationReport(reporterID, offenderID, reason string) {
	log.Printf("Violation Report Logged: Reporter=%s, Offender=%s, Reason=%s", reporterID, offenderID, reason)
	
	if Client != nil {
		_ = Client.Rpc("deduct_karma", "", map[string]interface{}{
			"p_device_id": offenderID,
			"p_amount":    20,
		})
	}
}


