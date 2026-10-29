package funcs

import (
	"encoding/json"
	"fmt"
	"net/http"
	"project/db/operations"
	"project/global"
	"sort"
	"strconv"
)

type TopUser struct {
	Place     int    `json:"place"`
	FirstName string `json:"first_name"`
	Balance   int32  `json:"balance"`
	AvatarURL string `json:"avatar_url"`
}

type TopResult struct {
	UserPosition TopUser   `json:"user_position"`
	Top10        []TopUser `json:"top_10"`
}

func HandleTop(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		global.RespondWithError(w, http.StatusMethodNotAllowed, "Only POST method is allowed")
		return
	}

	var userInfo global.UserInfo
	if err := json.NewDecoder(r.Body).Decode(&userInfo); err != nil {
		global.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	users, err := operations.GetAllUsers(r.Context())
	if err != nil {
		global.RespondWithError(w, http.StatusInternalServerError, "Failed to get users")
		return
	}

	config, err := global.LoadConfig()
	if err != nil {
		global.RespondWithError(w, http.StatusInternalServerError, "Failed to load config")
		return
	}

	sortUsersByBalance(users)
	result := processUsers(users, userInfo.TelegramID, config)

	global.RespondWithJson(w, http.StatusOK, map[string]interface{}{
		"result": result,
	})
}

func sortUsersByBalance(users []map[string]interface{}) {
	sort.Slice(users, func(i, j int) bool {
		balanceI, okI := users[i]["balance"].(int32)
		balanceJ, okJ := users[j]["balance"].(int32)
		return okI && okJ && balanceI > balanceJ
	})
}

func processUsers(users []map[string]interface{}, targetUserID int, config global.Config) TopResult {
	var result TopResult

	result.Top10 = make([]TopUser, 0, 10)
	for i, user := range users {
		firstName, _ := user["top_name"].(string)
		balance, _ := user["balance"].(int32)
		position := i + 1
		var avatarURL string
		if position > 11 {
			avatarURL, _ = user["avatar_url"].(string)
		} else {
			avatarURL = config.AvatarURL(position)
		}

		if fmt.Sprint(user["user_id"]) == strconv.Itoa(targetUserID) {
			firstName, _ = user["first_name"].(string)
			avatarURL, _ = user["avatar_url"].(string)
		}

		topUser := TopUser{
			Place:     position,
			FirstName: firstName,
			Balance:   balance,
			AvatarURL: avatarURL,
		}

		if fmt.Sprint(user["user_id"]) == strconv.Itoa(targetUserID) {
			result.UserPosition = topUser
		}

		if position <= 10 {
			result.Top10 = append(result.Top10, topUser)
		}
	}
	return result
}
