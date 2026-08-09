package api

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// GetUploadSignature generates a secure signature for Cloudinary uploads
// It strictly expects the 'folder' query parameter to be one of the allowed ones.
func GetUploadSignature(w http.ResponseWriter, r *http.Request) {
	// 1. Get the folder from query
	folder := r.URL.Query().Get("folder")
	
	// 2. Validate folder against our strict allowlist
	allowedFolders := map[string]bool{
		"LOVEWITHYOU/profiles":      true,
		"LOVEWITHYOU/chats":         true,
		"LOVEWITHYOU/verifications": true,
	}
	
	if !allowedFolders[folder] {
		http.Error(w, "forbidden - invalid folder", http.StatusForbidden)
		return
	}

	timestamp := time.Now().Unix()

	// Ensure "folder" matches exactly what you want
	paramsToSign := fmt.Sprintf("folder=%s&timestamp=%d", folder, timestamp)

	h := sha1.New()
	h.Write([]byte(paramsToSign + os.Getenv("CLOUDINARY_API_SECRET")))
	signature := hex.EncodeToString(h.Sum(nil))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"signature": signature,
		"timestamp": timestamp,
		"apiKey":    os.Getenv("CLOUDINARY_API_KEY"),
	})
}
