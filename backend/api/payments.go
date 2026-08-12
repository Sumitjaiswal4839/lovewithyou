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

	// 3. ✅ FIX: Fetch the actual Order from YOUR Database
	order, err := db.GetOrderDetails(req.OrderID) 
	if err != nil || order == nil {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// 4. ✅ FIX: REPLAY ATTACK PREVENTION
	if order.Status == "completed" || order.Status == "paid" {
		http.Error(w, "Payment already processed for this order", http.StatusConflict)
		return
	}

	// 5. Calculate Coins based on the SERVER-KNOWN amount (1 INR = 10 Coins)
	coinsToCredit := order.AmountINR * 10 

	// 6. ✅ ATOMIC UPDATE: Coins add karein aur Order ko "completed" mark karein ek hi sath
	err = db.CompleteOrderAndCreditCoins(req.OrderID, deviceID, coinsToCredit)
	if err != nil {
		http.Error(w, "Failed to process payment internally", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Payment verified and coins credited successfully",
		"coins_added": coinsToCredit,
	})
}
