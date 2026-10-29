package funcs

import (
	"encoding/json"
	"net/http"
	"project/db/operations"
	"project/global"

	"go.mongodb.org/mongo-driver/bson"
)

func CheckSubscription(w http.ResponseWriter, r *http.Request) {
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

	config, err := global.LoadConfig()
	if err != nil {
		global.RespondWithError(w, http.StatusInternalServerError, "Failed to load config")
		return
	}

	user, err := operations.Get(r.Context(), userInfo.TelegramID, bson.M{"user_id": userInfo.TelegramID})
	if err != nil {
		global.RespondWithError(w, http.StatusInternalServerError, "Failed to get user info")
		return
	}

	if hasSubscriptionBonus(user) {
		global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
			"subscribed": true,
		})
		return
	}

	status := getActualUserStatus(config.Token, config.ChatID, userInfo.TelegramID)
	if !isSubscribedStatus(status) {
		global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
			"subscribed": false,
		})
		return
	}

	if _, err := applySubscriptionBonus(r.Context(), userInfo.TelegramID, user); err != nil {
		global.RespondWithError(w, http.StatusInternalServerError, "Failed to apply subscription bonus")
		return
	}

	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"subscribed": true,
	})
}
