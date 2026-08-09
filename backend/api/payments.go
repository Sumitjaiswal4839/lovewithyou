package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"dating-backend/auth"
	"dating-backend/db"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
)

type PaymentVerifyReq struct {
	OrderID   string `json:"razorpay_order_id"`
	PaymentID string `json:"razorpay_payment_id"`
	Signature string `json:"razorpay_signature"`
	Amount    int    `json:"amount"` // Corresponding coin amount
}

func VerifyRazorpayPayment(w http.ResponseWriter, r *http.Request) {
	// 1. Get verified device_id from the AuthMiddleware context
	deviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req PaymentVerifyReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	if secret == "" {
		http.Error(w, "server configuration error", http.StatusInternalServerError)
		return
	}
	
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(req.OrderID + "|" + req.PaymentID))
	expected := hex.EncodeToString(mac.Sum(nil))

	// 2. Cryptographically verify the signature
	if !hmac.Equal([]byte(expected), []byte(req.Signature)) {
		http.Error(w, "invalid signature", http.StatusBadRequest)
		return
	}

	// 3. Securely add coins server-side using the atomic DB call
	_, err := db.UpdateCoinsAtomic(deviceID, req.Amount, "Razorpay purchase "+req.OrderID)
	if err != nil {
		http.Error(w, "failed to update coins", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "success"}`))
}
