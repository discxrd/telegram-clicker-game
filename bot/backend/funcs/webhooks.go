package funcs

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"project/db"
	"project/db/operations"
	"project/global"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type chatMemberUpdate struct {
	ChatMember struct {
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		NewChatMember struct {
			Status string `json:"status"`
			User   struct {
				ID int `json:"id"`
			} `json:"user"`
		} `json:"new_chat_member"`
	} `json:"chat_member"`
}

type RandomUserResponse struct {
	Results []struct {
		Name struct {
			First string `json:"first"`
			Last  string `json:"last"`
		} `json:"name"`
	} `json:"results"`
}

func toInt32(v interface{}) int32 {
	switch t := v.(type) {
	case int:
		return int32(t)
	case int32:
		return t
	case int64:
		return int32(t)
	case float64:
		return int32(t)
	default:
		return 0
	}
}

func getActualUserStatus(token, chatID string, userID int) string {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/getChatMember?chat_id=%s&user_id=%d", token, chatID, userID)
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("[getActualUserStatus] Error fetching status for user %d: %v", userID, err)
		return "error"
	}
	defer resp.Body.Close()

	var result struct {
		Ok     bool `json:"ok"`
		Result struct {
			Status string `json:"status"`
		} `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("[getActualUserStatus] Error decoding response for user %d: %v", userID, err)
		return "error"
	}

	if !result.Ok {
		log.Printf("[getActualUserStatus] API returned ok=false for user %d, assuming left", userID)
		return "left"
	}

	log.Printf("[getActualUserStatus] User %d actual status: %s", userID, result.Result.Status)
	return result.Result.Status
}

func getRandomName() string {
	resp, err := http.Get("https://randomuser.me/api/")
	if err != nil {
		log.Printf("Error getting random user: %v", err)
		return ""
	}
	defer resp.Body.Close()

	var result RandomUserResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Error decoding response: %v", err)
		return ""
	}

	if len(result.Results) > 0 {
		return fmt.Sprintf("%s %s", result.Results[0].Name.First, result.Results[0].Name.Last)
	}

	return ""
}

func downloadAndSaveAvatar(userID int) string {
	config, err := global.LoadConfig()
	if err != nil {
		log.Printf("Error loading config: %v", err)
		return ""
	}
	avatar := config.AvatarURL(11)

	botURL := fmt.Sprintf("https://api.telegram.org/bot%s/getUserProfilePhotos", config.Token)
	params := map[string]interface{}{
		"user_id": userID,
		"limit":   1,
	}

	jsonParams, err := json.Marshal(params)
	if err != nil {
		log.Printf("Error marshaling params: %v", err)
		return avatar
	}

	resp, err := http.Post(botURL, "application/json", bytes.NewBuffer(jsonParams))
	if err != nil {
		log.Printf("Error getting profile photos: %v", err)
		return avatar
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Error decoding response: %v", err)
		return avatar
	}

	avatar_have := false

	if photos, ok := result["result"].(map[string]interface{}); ok {
		if photoArray, ok := photos["photos"].([]interface{}); ok && len(photoArray) > 0 {
			if photo := photoArray[0].([]interface{}); len(photo) > 0 {
				if fileID, ok := photo[len(photo)-1].(map[string]interface{})["file_id"].(string); ok {
					fileURL := fmt.Sprintf("https://api.telegram.org/bot%s/getFile?file_id=%s", config.Token, fileID)
					fileResp, err := http.Get(fileURL)
					if err != nil {
						log.Printf("Error getting file info: %v", err)
						return avatar
					}
					defer fileResp.Body.Close()

					var fileInfo map[string]interface{}
					if err := json.NewDecoder(fileResp.Body).Decode(&fileInfo); err != nil {
						log.Printf("Error decoding file info: %v", err)
						return avatar
					}

					if filePath, ok := fileInfo["result"].(map[string]interface{})["file_path"].(string); ok {
						downloadURL := fmt.Sprintf("https://api.telegram.org/file/bot%s/%s", config.Token, filePath)
						photoResp, err := http.Get(downloadURL)
						if err != nil {
							log.Printf("Error downloading photo: %v", err)
							return avatar
						}
						defer photoResp.Body.Close()

						if err := os.MkdirAll("./avatar", 0o755); err != nil {
							log.Printf("Error creating avatar directory: %v", err)
							return avatar
						}

						out, err := os.Create(fmt.Sprintf("./avatar/%d.png", userID))
						if err != nil {
							log.Printf("Error creating file: %v", err)
							return avatar
						}
						defer out.Close()

						_, err = io.Copy(out, photoResp.Body)
						if err != nil {
							log.Printf("Error saving photo: %v", err)
							return avatar
						}

						avatar_have = true
					}
				}
			}
		}
	}

	if avatar_have {
		avatar = config.AvatarURL(userID)
	}

	return avatar
}

func generateReferralCode() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, 6)
	for i := range result {
		result[i] = chars[rand.Intn(len(chars))]
	}
	return string(result)
}

func Start(w http.ResponseWriter, r *http.Request, userID int, firstName string, text string) {
	code := ""
	if strings.HasPrefix(text, "/start ") {
		code = strings.Split(text, " ")[1]
	}

	if _, err := operations.Get(r.Context(), userID, bson.M{"user_id": userID}); err != nil {

		// if code != "" {
		// referer, err := operations.Get(r.Context(), 0, bson.M{"referral_code": code})
		// if err != nil {
		// trackerURL := fmt.Sprintf("https://thedinator.com/tracker/bot/webhook/CSR8tYEE?user_id=%d&subscriber_id=%s", userID, code)
		// resp, err := http.Get(trackerURL)
		// if err != nil {
		// log.Printf("    : %v", err)
		// } else {
		// defer resp.Body.Close()
		// body, _ := io.ReadAll(resp.Body)
		// fmt.Printf("  : %s\n", string(body))
		// }
		// }

		// fmt.Println(referer["user_id"])
		// if referer["user_id"] != userID {
		// referrals := referer["referrals"].(primitive.A)
		// referrals = append(referrals, userID)
		// fmt.Println(referrals)
		// operations.UpdateUserField(r.Context(), int(referer["user_id"].(int64)), "referrals", referrals)
		// fmt.Println(referer["user_id"])
		// operations.IncrementUserField(r.Context(), userID, "balance", 20)
		// fmt.Println("balance: ")
		// operations.IncrementUserField(r.Context(), int(referer["user_id"].(int64)), "balance", 20)
		// }
		// }

		var aio interface{} = nil
		if strings.Contains(code, "_") {
			parts := strings.SplitN(code, "_", 2)
			if len(parts) == 2 {
				code = parts[0]
				aio = parts[1]
			}
		}

		fmt.Println(12345)

		referralCode := generateReferralCode()
		avatarURL := downloadAndSaveAvatar(userID)

		userData := map[string]interface{}{
			"user_id":       userID,
			"first_name":    firstName,
			"joined_at":     time.Now(),
			"balance":       0,
			"referrals":     []interface{}{},
			"referral_code": referralCode,
			"energy":        30,
			"energy_max":    30,
			"referred_by":   nil,
			"modifies": map[string]interface{}{
				"toques_lvl":      1,
				"subscribe_bonus": false,
			},
			"avatar_url": avatarURL,
			"top_name":   getRandomName(),
			"utm_code":   code,
			"aio_code":   aio,
		}

		if err := operations.Insert(r.Context(), userData); err != nil {
			log.Printf("Error creating user: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		aioStr := ""
		if aio != nil {
			if str, ok := aio.(string); ok {
				aioStr = str
			}
		}
		sendLeadWebhook(aioStr)
	}

	config, err := global.LoadConfig()
	if err != nil {
		log.Printf("Error loading config: %v", err)
		http.Error(w, "Error loading config", http.StatusInternalServerError)
		return
	}

	botURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", config.Token)
	messageData := map[string]interface{}{
		"chat_id": userID,
		"text":    config.Text,
		"reply_markup": map[string]interface{}{
			"inline_keyboard": [][]map[string]interface{}{
				{
					{
						"text": config.WelcomeButtonText,
						"web_app": map[string]interface{}{
							"url": config.URL,
						},
					},
				},
			},
		},
	}

	jsonData, err := json.Marshal(messageData)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	resp, err := http.Post(botURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error sending message: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(http.StatusOK)
}

func SendWebhook(body string) {
	webhookURL := "https://sixadmin.com/webhook/25eeaeceaaaa8bd90b8e31382c393e60"
	fmt.Println(body)
	req, err := http.NewRequest(http.MethodPost, webhookURL, bytes.NewBuffer([]byte(body)))
	if err != nil {
		log.Printf("Error creating webhook request: %v", err)
		return
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending webhook: %v", err)
		return
	}

	defer resp.Body.Close()

	log.Printf("Webhook sent successfully: %d", resp.StatusCode)
	log.Println(string(body))
}

func sendConversionWebhook(clickID string) {
	if clickID == "" {
		return
	}

	webhookURL := fmt.Sprintf("https://app.aio.tech/api/v1/trigger/conversion/%s/0325ec88-3b5b-410f-8ecf-16382fe2d8c4?arrived_revenue=0", clickID)

	req, err := http.NewRequest(http.MethodGet, webhookURL, nil)
	if err != nil {
		log.Printf("Error creating conversion webhook request: %v", err)
		return
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending conversion webhook: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("Conversion webhook sent successfully: %d", resp.StatusCode)
}

func sendLeadWebhook(clickID string) {
	if clickID == "" {
		return
	}

	webhookURL := fmt.Sprintf("https://app.aio.tech/api/v1/trigger/conversion/%s/e183a36c-27ed-4ded-92f8-9bc782e6a377?arrived_revenue=0", clickID)

	req, err := http.NewRequest(http.MethodGet, webhookURL, nil)
	if err != nil {
		log.Printf("Error creating lead webhook request: %v", err)
		return
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending lead webhook: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("Lead webhook sent successfully: %d", resp.StatusCode)
}

func WebhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusOK)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		w.WriteHeader(http.StatusOK)
		return
	}

	SendWebhook(string(body))

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		w.WriteHeader(http.StatusOK)
		return
	}
	fmt.Println(data)

	// Handle chat_join_request (for channels with join requests enabled)
	if joinRequest, ok := data["chat_join_request"].(map[string]interface{}); ok {
		chat, _ := joinRequest["chat"].(map[string]interface{})
		from, _ := joinRequest["from"].(map[string]interface{})

		chatID := ""
		if chat != nil {
			switch id := chat["id"].(type) {
			case float64:
				chatID = strconv.FormatInt(int64(id), 10)
			case int64:
				chatID = strconv.FormatInt(id, 10)
			case int:
				chatID = strconv.Itoa(id)
			}
		}

		userID := 0
		if from != nil {
			if idf, ok := from["id"].(float64); ok {
				userID = int(idf)
			}
		}

		config, err := global.LoadConfig()
		if err != nil {
			log.Printf("Error loading config: %v", err)
			w.WriteHeader(http.StatusOK)
			return
		}

		if chatID == config.ChatID && userID > 0 {
			log.Printf("[CHAT_JOIN_REQUEST] User %d requested to join channel", userID)

			// Auto-approve the join request
			approveURL := fmt.Sprintf("https://api.telegram.org/bot%s/approveChatJoinRequest", config.Token)
			approveData := map[string]interface{}{
				"chat_id": chatID,
				"user_id": userID,
			}

			jsonData, _ := json.Marshal(approveData)
			resp, err := http.Post(approveURL, "application/json", bytes.NewBuffer(jsonData))
			if err != nil {
				log.Printf("Error approving join request: %v", err)
			} else {
				defer resp.Body.Close()
				log.Printf("[CHAT_JOIN_REQUEST] Approved join request for user %d", userID)

				// Give subscription bonus
				handleMemberJoin(r, userID)
			}

			w.WriteHeader(http.StatusOK)
			return
		}
	}

	//  kicked and channel subscription tracking
	if myChatMember, ok := data["my_chat_member"].(map[string]interface{}); ok {
		chat, _ := myChatMember["chat"].(map[string]interface{})
		chatID := ""
		if chat != nil {
			switch id := chat["id"].(type) {
			case float64:
				chatID = strconv.FormatInt(int64(id), 10)
			case int64:
				chatID = strconv.FormatInt(id, 10)
			case int:
				chatID = strconv.Itoa(id)
			}
		}

		config, err := global.LoadConfig()
		if err != nil {
			log.Printf("Error loading config: %v", err)
			w.WriteHeader(http.StatusOK)
			return
		}

		// Проверяем что это наш канал
		if chatID == config.ChatID {
			newChatMember, _ := myChatMember["new_chat_member"].(map[string]interface{})
			oldChatMember, _ := myChatMember["old_chat_member"].(map[string]interface{})
			from, _ := myChatMember["from"].(map[string]interface{})

			userID := 0
			if from != nil {
				if idf, ok := from["id"].(float64); ok {
					userID = int(idf)
				}
			}

			newStatus, _ := newChatMember["status"].(string)
			oldStatus, _ := oldChatMember["status"].(string)

			log.Printf("[MY_CHAT_MEMBER] User %d status change: '%s' -> '%s'", userID, oldStatus, newStatus)

			// For channels with join requests, status might be empty
			// Check if user left/kicked
			if newStatus == "left" || newStatus == "kicked" {
				log.Println("[MY_CHAT_MEMBER] User left/kicked, user_id:", userID)
				handleMemberLeft(r, userID)
			} else if (oldStatus == "left" || oldStatus == "kicked" || oldStatus == "") && newStatus == "member" {
				log.Println("[MY_CHAT_MEMBER] User joined, user_id:", userID)
				handleMemberJoin(r, userID)
			}

			w.WriteHeader(http.StatusOK)
			return
		}
	}

	//  /start
	if message, ok := data["message"].(map[string]interface{}); ok {
		fmt.Println(true)
		if text, ok := message["text"].(string); ok && strings.HasPrefix(text, "/start") {
			from := message["from"].(map[string]interface{})
			userID := int(from["id"].(float64))
			firstName := from["first_name"].(string)
			Start(w, r, userID, firstName, text)
			return
		}
	}

	fmt.Println(string(body))

	//    (/)
	if chatMember, ok := data["chat_member"].(map[string]interface{}); ok {
		chat, _ := chatMember["chat"].(map[string]interface{})
		chatID := ""
		if chat != nil {
			switch id := chat["id"].(type) {
			case float64:
				chatID = strconv.FormatInt(int64(id), 10)
			case int64:
				chatID = strconv.FormatInt(id, 10)
			case int:
				chatID = strconv.Itoa(id)
			}
		}

		config, err := global.LoadConfig()
		if err != nil {
			log.Printf("Error loading config: %v", err)
			w.WriteHeader(http.StatusOK)
			return
		}
		if chatID != config.ChatID {
			w.WriteHeader(http.StatusOK)
			return
		}

		// userID
		newMember, _ := chatMember["new_chat_member"].(map[string]interface{})
		oldMember, _ := chatMember["old_chat_member"].(map[string]interface{})
		user, _ := newMember["user"].(map[string]interface{})
		userID := 0
		if user != nil {
			if idf, ok := user["id"].(float64); ok {
				userID = int(idf)
			}
		}
		newStatus, _ := newMember["status"].(string)
		oldStatus, _ := oldMember["status"].(string)

		chatType, _ := chat["type"].(string)
		log.Printf("[CHAT_MEMBER] DEBUG: User %d status change in %s: '%s' -> '%s'", userID, chatType, oldStatus, newStatus)

		// Обработка для каналов и групп
		if newStatus == "left" || newStatus == "kicked" {
			log.Printf("[CHAT_MEMBER] User %d left/kicked (status: %s)", userID, newStatus)
			handleMemberLeft(r, userID)
		} else if newStatus == "" && (oldStatus == "member" || oldStatus == "") {
			// Если статусы пустые, проверяем реальный статус через API
			log.Printf("[CHAT_MEMBER] Empty statuses for user %d, checking actual status via API", userID)
			actualStatus := getActualUserStatus(config.Token, config.ChatID, userID)
			log.Printf("[CHAT_MEMBER] Actual status for user %d: %s", userID, actualStatus)

			if actualStatus == "left" || actualStatus == "kicked" {
				log.Printf("[CHAT_MEMBER] User %d confirmed left via API", userID)
				handleMemberLeft(r, userID)
			} else if actualStatus == "member" || actualStatus == "administrator" || actualStatus == "creator" {
				log.Printf("[CHAT_MEMBER] User %d confirmed member via API", userID)
				handleMemberJoin(r, userID)
			}
		} else if newStatus == "member" || newStatus == "administrator" || newStatus == "creator" {
			log.Printf("[CHAT_MEMBER] User %d joined (status: %s)", userID, newStatus)
			handleMemberJoin(r, userID)
		} else {
			log.Printf("[CHAT_MEMBER] DEBUG: No action taken for status change '%s' -> '%s'", oldStatus, newStatus)
		}

		w.WriteHeader(http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusOK)
}
func parseUpdate(body []byte) (*chatMemberUpdate, error) {
	var update chatMemberUpdate
	if err := json.Unmarshal(body, &update); err != nil {
		log.Printf("Raw body: %s", body)
		return nil, fmt.Errorf("unmarshaling update: %w", err)
	}

	return &update, nil
}

func handleMemberJoin(r *http.Request, userID int) {
	log.Printf("[handleMemberJoin] START: Processing user %d", userID)
	user, err := operations.Get(r.Context(), userID, bson.M{"user_id": userID})
	if err != nil || user == nil {
		log.Printf("[handleMemberJoin] ERROR: User %d not found in database: %v", userID, err)
		return
	}
	log.Printf("[handleMemberJoin] User %d found in database", userID)

	applied, err := applySubscriptionBonus(r.Context(), userID, user)
	if err != nil {
		log.Printf("[handleMemberJoin] ERROR: Failed to apply subscription bonus for user %d: %v", userID, err)
		return
	}
	if !applied {
		log.Printf("[handleMemberJoin] User %d already has subscribe_bonus=true, skipping", userID)
		return
	}
	log.Printf("[handleMemberJoin] Subscription bonus applied for user %d", userID)

	utmCode := ""
	if utmCodeVal, ok := user["aio_code"]; ok && utmCodeVal != nil {
		if utmCodeStr, ok := utmCodeVal.(string); ok {
			utmCode = utmCodeStr
		}
	}
	sendConversionWebhook(utmCode)
	log.Printf("[handleMemberJoin] COMPLETE: User %d subscription bonus applied", userID)
}

func handleMemberLeft(r *http.Request, userID int) {
	log.Printf("[handleMemberLeft] START: Processing user %d", userID)
	user, err := operations.Get(r.Context(), userID, bson.M{"user_id": userID})
	if err != nil || user == nil {
		log.Printf("[handleMemberLeft] ERROR: User %d not found in database: %v", userID, err)
		return
	}
	log.Printf("[handleMemberLeft] User %d found in database", userID)

	if !hasSubscriptionBonus(user) {
		log.Printf("[handleMemberLeft] User %d has subscribe_bonus=false, nothing to remove", userID)
		return
	}
	log.Printf("[handleMemberLeft] User %d has subscribe_bonus=true, proceeding to remove bonus", userID)

	energyMax := toInt32(user["energy_max"])
	if energyMax == 0 && user["energy_max"] != nil {
		log.Printf("[handleMemberLeft] ERROR: Failed to convert energy_max for user %d, type: %T", userID, user["energy_max"])
		return
	}
	log.Printf("[handleMemberLeft] Current energy_max for user %d: %d", userID, energyMax)

	bonusEnergy := subscriptionBonusEnergy()
	newEnergyMax := energyMax - bonusEnergy
	if newEnergyMax < 0 {
		newEnergyMax = 0
	}
	log.Printf("[handleMemberLeft] Calculated new energy_max: %d (-%d)", newEnergyMax, bonusEnergy)

	energy := toInt32(user["energy"])
	if energy == 0 && user["energy"] != nil {
		log.Printf("[handleMemberLeft] ERROR: Failed to convert energy for user %d, type: %T", userID, user["energy"])
		return
	}
	log.Printf("[handleMemberLeft] Current energy for user %d: %d", userID, energy)

	if energy > newEnergyMax {
		if err := operations.UpdateUserField(r.Context(), userID, "energy", newEnergyMax); err != nil {
			log.Printf("[handleMemberLeft] ERROR: Failed to update energy for user %d: %v", userID, err)
			return
		}
		log.Printf("[handleMemberLeft] Capped energy from %d to %d for user %d", energy, newEnergyMax, userID)
	}

	if err := operations.UpdateUserField(r.Context(), userID, "energy_max", newEnergyMax); err != nil {
		log.Printf("[handleMemberLeft] ERROR: Failed to update energy_max for user %d: %v", userID, err)
	}
	log.Printf("[handleMemberLeft] Updated energy_max from %d to %d for user %d", energyMax, newEnergyMax, userID)

	if err := operations.UpdateUserField(r.Context(), userID, "modifies.subscribe_bonus", false); err != nil {
		log.Printf("[handleMemberLeft] ERROR: Failed to update subscribe_bonus for user %d: %v", userID, err)
	}
	log.Printf("[handleMemberLeft] Updated subscribe_bonus=false for user %d", userID)

	log.Printf("[handleMemberLeft] COMPLETE: User %d subscription bonus removed", userID)
}

func isSubscribedStatus(status string) bool {
	switch status {
	case "member", "administrator", "creator":
		return true
	default:
		return false
	}
}

func hasSubscriptionBonus(user map[string]interface{}) bool {
	modifies, ok := user["modifies"].(map[string]interface{})
	if !ok {
		if bsonModifies, ok := user["modifies"].(bson.M); ok {
			modifies = bsonModifies
		}
	}
	if modifies == nil {
		return false
	}

	bonus, ok := modifies["subscribe_bonus"].(bool)
	return ok && bonus
}

func applySubscriptionBonus(ctx context.Context, userID int, user map[string]interface{}) (bool, error) {
	if hasSubscriptionBonus(user) {
		return false, nil
	}

	bonusEnergy := subscriptionBonusEnergy()
	collection := db.GetClient().Database("db").Collection("users")
	result, err := collection.UpdateOne(
		ctx,
		bson.M{"user_id": userID, "modifies.subscribe_bonus": bson.M{"$ne": true}},
		bson.M{
			"$inc": bson.M{"energy_max": bonusEnergy},
			"$set": bson.M{"modifies.subscribe_bonus": true},
		},
	)
	if err != nil {
		return false, err
	}
	if result.MatchedCount == 0 || result.ModifiedCount == 0 {
		return false, nil
	}

	log.Printf("[applySubscriptionBonus] Added %d energy_max and marked subscribe_bonus for user %d", bonusEnergy, userID)
	return true, nil
}

func subscriptionBonusEnergy() int32 {
	config, err := global.LoadConfig()
	if err != nil || config.SubscriptionBonusEnergy <= 0 {
		return 20
	}

	return int32(config.SubscriptionBonusEnergy)
}
