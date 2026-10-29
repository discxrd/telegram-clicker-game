package funcs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"

	"project/db/operations"
	"project/global"

	"go.mongodb.org/mongo-driver/bson"
)

// BalanceMinus handles balance deduction operation
func BalanceMinus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.RespondWithError(w, http.StatusMethodNotAllowed, "Only POST method is allowed")
		return
	}

	var data global.BalanceMinusInfo
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		global.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	fmt.Println(data.TelegramID)
	userID := data.TelegramID
	if userID == 0 {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	amount := data.Amount
	if amount == 0 {
		http.Error(w, "amount is required", http.StatusBadRequest)
		return
	}

	// get user balance
	filter := bson.M{"user_id": userID}
	user, err := operations.Get(context.Background(), 0, filter)
	if err != nil {
		log.Printf("error getting user: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
 
	var balance float64
	if balanceFloat, ok := user["balance"].(float64); ok {
		balance = math.Round(balanceFloat*100) / 100
		fmt.Println(balance)
	} else if balanceInt, ok := user["balance"].(int32); ok {
		balance = math.Round(float64(balanceInt)*100) / 100
		fmt.Println(balance)
	} else {
		log.Printf("Error: balance is not of type float64 or int32")
		global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if balance < amount {
		http.Error(w, "insufficient balance", http.StatusBadRequest)
		return
	}


	if err := operations.DecrementUserField(context.Background(), userID, "balance", amount); err != nil {
		log.Printf("error updating balance: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("deducted %.2f from balance", amount),
	})
}

