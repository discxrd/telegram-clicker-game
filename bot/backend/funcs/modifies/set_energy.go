package modifies

import (
	"encoding/json"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"

	"project/db/operations"
	"project/global"
)

func HandleSetEnergy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.RespondWithError(w, http.StatusMethodNotAllowed, "Only POST method is allowed")
		return
	}

	var userInfo global.SetEnergy
	if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
		global.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if userInfo.TelegramID == 0 {
		global.RespondWithError(w, http.StatusBadRequest, "telegram_id is required")
		return
	}

	err := operations.UpdateUserField(r.Context(), userInfo.TelegramID, "energy", userInfo.NewEnergy)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			global.RespondWithError(w, http.StatusNotFound, "User not found")
		} else {
			log.Printf("Error updating user energy: %v", err)
			global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"message": "Energy updated successfully",
	})
	log.Println("Successfully processed request in /set_energy")
}
