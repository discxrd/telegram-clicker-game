// Start of Selection
package funcs

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"

	"project/db/operations"
	"project/global"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func HandleInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.RespondWithError(w, http.StatusMethodNotAllowed, "Only POST method is allowed")
		return
	}

	var userInfo global.UserInfo
	if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
		global.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if userInfo.TelegramID == 0 {
		global.RespondWithError(w, http.StatusBadRequest, "telegram_id is required")
		return
	}

	user, err := operations.Get(r.Context(), userInfo.TelegramID, bson.M{"user_id": userInfo.TelegramID})
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			global.RespondWithError(w, http.StatusNotFound, "User not found")
		} else {
			log.Printf("Error finding user: %v", err)
			global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	referrals, ok := user["referrals"].(primitive.A)
	if !ok {
		log.Printf("Error: referrals is not of type primitive.A")
		global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	user["referrals"] = len(referrals)
	if joinedAt, ok := user["joined_at"].(primitive.DateTime); ok {
		formattedDate := joinedAt.Time().Format("02.01.2006")
		user["joined_at"] = formattedDate
	} else {
		log.Printf("Error: joined_at is not of type primitive.DateTime")
		global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
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

	user["balance"] = balance
	adjustedBalance := balance * 0.00449986
	user["converted_balance"] = adjustedBalance

	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"ok":   true,
		"info": user,
	})
	log.Println("Successfully processed request in /get_info")
}