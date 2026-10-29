package funcs

import (
	"fmt"
	"net/http"
	"time"

	"project/db/operations"
	"project/global"
)

func HandleGetTimer(w http.ResponseWriter, r *http.Request) {
	timer, err := operations.GetTimer(r.Context())
	if err != nil {
		fmt.Println(err)
		global.RespondWithError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	daysLeft := int(timer.Sub(time.Now()).Hours() / 24)
	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"days_left": daysLeft,
	})
}
