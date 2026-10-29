package modifies

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"project/db/operations"
	"project/global"
)

func HandleSetTimer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.RespondWithError(w, http.StatusMethodNotAllowed, "Only POST method is allowed")
		return
	}

	var timerInfo struct {
		Days       int   `json:"days"`
	}

	if err := json.NewDecoder(r.Body).Decode(&timerInfo); err != nil {
		global.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if timerInfo.Days <= 0 {
		global.RespondWithError(w, http.StatusBadRequest, "Days must be a positive integer")
		return
	}

	endTime := time.Now().AddDate(0, 0, timerInfo.Days)

	err := operations.UpdateUserTimer(r.Context(), endTime)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			global.RespondWithError(w, http.StatusNotFound, "User not found")
		} else {
			log.Printf("Error updating user timer: %v", err)
			global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		}
		return
	}

	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"message": "Timer set successfully",
		"end_time": endTime,
	})
	log.Println("Successfully processed request in /set_timer")
}
