package funcs

import (
	"net/http"
	"project/db/operations"
	"project/global"
)

// HandleGetAllUsers обрабатывает запросы на получение всех пользователей
func HandleGetAllUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		global.RespondWithError(w, http.StatusMethodNotAllowed, "Допускается только метод GET")
		return
	}

	users, err := operations.GetAllUsers(r.Context())
	if err != nil {
		global.RespondWithError(w, http.StatusInternalServerError, "Не удалось получить пользователей")
		return
	}

	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"users": users,
	})
}

