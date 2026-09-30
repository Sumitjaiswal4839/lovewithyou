package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"dating-backend/auth"
	"dating-backend/db"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

type PaymentVerifyReq struct {
	OrderID   string `json:"razorpay_order_id"`
	PaymentID string `json:"razorpay_payment_id"`
	Signature string `json:"razorpay_signature"`
}

type OrderCreateReq struct {
	Amount int `json:"amount_inr"`
}

func CreateRazorpayOrder(w http.ResponseWriter, r *http.Request) {
	deviceID, ok := r.Context().Value(auth.DeviceIDKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req OrderCreateReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	keyID := os.Getenv("RAZORPAY_KEY_ID")
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	if keyID == "" || secret == "" {
		http.Error(w, "server configuration error", http.StatusInternalServerError)
		return
	}

	// 1. Create Order via Razorpay API
	url := "https://api.razorpay.com/v1/orders"
	payload := fmt.Sprintf(`{"amount":%d,"currency":"INR","receipt":"receipt_%s"}`, req.Amount*100, deviceID)
	httpReq, _ := http.NewRequest("POST", url, strings.NewReader(payload))
	httpReq.SetBasicAuth(keyID, secret)
	httpReq.Header.Add("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(httpReq)
	if err != nil || res.StatusCode != 200 {
		http.Error(w, "failed to create razorpay order", http.StatusInternalServerError)
		return
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	var rzpResp map[string]interface{}
	json.Unmarshal(body, &rzpResp)

	orderID, _ := rzpResp["id"].(string)

	// 2. Insert into payment_orders table
	orderData := map[string]interface{}{
		"order_id":   orderID,
		"device_id":  deviceID,
		"amount_inr": req.Amount,
		"status":     "created",
	}
	_, _, err = db.Client.From("payment_orders").Insert(orderData, false, "", "", "").Execute()
	if err != nil {
		log.Printf("Error inserting order: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	// 3. Return the order_id to the client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"order_id": orderID,
	})
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
