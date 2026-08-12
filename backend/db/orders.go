package db

import (
	"encoding/json"
	"fmt"
)

type PaymentOrder struct {
	OrderID   string `json:"order_id"`
	DeviceID  string `json:"device_id"`
	AmountINR int    `json:"amount_inr"`
	Status    string `json:"status"`
}

func GetOrderDetails(orderID string) (*PaymentOrder, error) {
	if Client == nil {
		return nil, fmt.Errorf("supabase client not initialized")
	}

	data, _, err := Client.From("payment_orders").Select("*", "exact", false).Eq("order_id", orderID).Single().Execute()
	if err != nil {
		return nil, err
	}

	var order PaymentOrder
	if err := json.Unmarshal(data, &order); err != nil {
		return nil, err
	}

	return &order, nil
}

func CompleteOrderAndCreditCoins(orderID, deviceID string, coins int) error {
	if Client == nil {
		return fmt.Errorf("supabase client not initialized")
	}

	// 1. Mark order as completed
	updateData := map[string]interface{}{"status": "completed"}
	_, _, err := Client.From("payment_orders").Update(updateData, "", "exact").Eq("order_id", orderID).Execute()
	if err != nil {
		return fmt.Errorf("failed to update order: %v", err)
	}

	// 2. Add coins
	_, err = UpdateCoinsAtomic(deviceID, coins, "Razorpay purchase "+orderID)
	if err != nil {
		return fmt.Errorf("failed to credit coins: %v", err)
	}

	return nil
}
