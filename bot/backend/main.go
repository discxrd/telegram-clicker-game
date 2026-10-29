package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"project/db"
	"project/db/operations"
	"project/funcs"
	"project/funcs/modifies"
	"project/funcs/recovery"
	"project/global"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var config global.Config

func main() {
	var err error
	config, err = global.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	if shouldMonitorBotStatus() {
		go monitorBotStatus()
	}

	if err := run(); err != nil {
		log.Fatalf("Error running server: %v", err)
	}
}

func sendTelegramNotification(message string) {
	if config.AlertChatID == "" {
		return
	}

	urlStr := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", config.Token)
	data := url.Values{}
	data.Set("chat_id", config.AlertChatID)
	data.Set("text", message)

	resp, err := http.PostForm(urlStr, data)
	if err != nil {
		log.Printf("Error sending Telegram message: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Failed to send message: %v", resp.Status)
	}
}

func broadcastMessage(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	var reqBody struct {
		Message string `json:"message"`
	}
	err := json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil || reqBody.Message == "" {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	users, err := operations.GetAllUsers(ctx)
	if err != nil {
		http.Error(w, "Failed to get users", http.StatusInternalServerError)
		return
	}

	for _, user := range users {
		userIDInterface := user["user_id"]

		var userID int64
		switch v := userIDInterface.(type) {
		case string:
			id, err := strconv.ParseInt(v, 10, 64)
			if err != nil {
				log.Printf("Error converting user_id to int64: %v", err)
				continue
			}
			userID = id
		case float64:
			userID = int64(v)
		case int64:
			userID = v
		default:
			log.Printf("Invalid type for user_id: %T", v)
			continue
		}

		log.Printf("Sending message to user ID: %d", userID)

		success := sendTelegramMessageWithButton(int(userID), reqBody.Message, config.URL)
		recordMessageStatus(ctx, int(userID), success)
	}

	w.Write([]byte("Message sent to all users"))
}

func sendTelegramMessageWithButton(chatID int, message string, webAppURL string) bool {
	urlStr := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", config.Token)
	data := url.Values{}
	data.Set("chat_id", fmt.Sprintf("%d", chatID))
	data.Set("text", message)
	replyMarkup := fmt.Sprintf(`{
        "inline_keyboard": [[{"text": "Open App", "web_app": {"url": "%s"}}]]
    }`, webAppURL)
	data.Set("reply_markup", replyMarkup)

	resp, err := http.PostForm(urlStr, data)
	if err != nil {
		log.Printf("Error sending message to %d: %v", chatID, err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return true
	}

	log.Printf("Failed to send message to %d: %v", chatID, resp.Status)
	return false
}

func recordMessageStatus(ctx context.Context, telegramID int, success bool) error {
	client := db.GetClient()
	collection := client.Database("db").Collection("message_statuses")

	filter := bson.M{"user_id": telegramID}
	update := bson.M{
		"$set": bson.M{
			"user_id":             telegramID,
			"last_message_status": success,
			"timestamp":           time.Now(),
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(ctx, filter, update, opts)
	return err
}

func getMailingStatistics(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	client := db.GetClient()
	collection := client.Database("db").Collection("message_statuses")

	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.M{"timestamp": -1}))
	if err != nil {
		http.Error(w, "Failed to get mailing statistics", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		http.Error(w, "Failed to decode mailing statistics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, "Failed to encode mailing statistics", http.StatusInternalServerError)
		return
	}
}

func monitorBotStatus() {
	for {
		time.Sleep(1 * time.Minute)
		status, err := checkBotStatus()
		if err != nil {
			log.Printf("Error checking bot status: %v", err)
			continue
		}
		if status == "offline" {
			log.Println("Bot is offline, sending notification...")
			sendTelegramNotification("Bot is down")
			continue
		}

		log.Printf("Bot status monitor: %s", status)
	}
}

func run() error {
	log.Println("Connected to MongoDB")
	port := serverPort()

	mux := http.NewServeMux()

	mux.HandleFunc("/balance/minus", funcs.BalanceMinus)
	mux.HandleFunc("/get_info", funcs.HandleInfo)
	mux.HandleFunc("/check_subscription", funcs.CheckSubscription)
	mux.HandleFunc("/clicker", funcs.HandleClicker)
	mux.HandleFunc("/buy_toques", modifies.HandleBuyToques)
	mux.HandleFunc("/top", funcs.HandleTop)
	mux.HandleFunc("/get_avatar", func(res http.ResponseWriter, req *http.Request) {
		funcs.GetAvatar(res, req)
	})
	mux.HandleFunc("/set_toques", modifies.HandleSetToques)
	mux.HandleFunc("/set_balance", modifies.HandleSetBalance)
	mux.HandleFunc("/set_energy", modifies.HandleSetEnergy)
	mux.HandleFunc("/users", funcs.HandleGetAllUsers)
	mux.HandleFunc("/set_timer", modifies.HandleSetTimer)
	mux.HandleFunc("/get_timer", funcs.HandleGetTimer)

	mux.HandleFunc("/broadcast", broadcastMessage)
	mux.HandleFunc("/getMailing", getMailingStatistics)
	mux.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		status, err := checkBotStatus()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(fmt.Sprintf(`{"status": false, "error": "%v"}`, err)))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"status": "%s"}`, status)))
	})
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	mux.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
		secretToken := r.Header.Get("X-Telegram-Bot-Api-Secret-Token")
		if secretToken != config.WebhookSecret {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		funcs.WebhookHandler(w, r)
	})

	c := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins(),
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
		MaxAge:         300,
	})

	server := &http.Server{
		Addr:    ":" + port,
		Handler: c.Handler(mux),
	}

	go recovery.StartEnergyRecovery()

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("Server starting on :%s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	<-done
	log.Println("Server stopping...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		return err
	}

	log.Println("Server stopped gracefully")
	return nil
}

func checkBotStatus() (string, error) {
	if _, err := exec.LookPath("pm2"); err != nil {
		return "disabled", nil
	}

	cmd := exec.Command("pm2", "status")
	output, err := cmd.Output()
	if err != nil {
		return "offline", err
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "main") {
			if strings.Contains(line, "online") {
				return "online", nil
			}
			if strings.Contains(line, "stopped") {
				return "offline", nil
			}
		}
	}

	return "offline", nil
}

func serverPort() string {
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		return "3000"
	}

	return port
}

func allowedOrigins() []string {
	if origins := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS")); origins != "" {
		return splitAndTrim(origins)
	}

	if baseURL := config.PublicBaseURL(); baseURL != "" {
		return []string{baseURL}
	}

	return []string{"*"}
}

func splitAndTrim(csv string) []string {
	parts := strings.Split(csv, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}

	if len(result) == 0 {
		return []string{"*"}
	}

	return result
}

func shouldMonitorBotStatus() bool {
	raw, ok := os.LookupEnv("BOT_STATUS_MONITOR_ENABLED")
	if ok {
		raw = strings.TrimSpace(strings.ToLower(raw))
		return raw == "1" || raw == "true" || raw == "yes" || raw == "on"
	}

	_, err := exec.LookPath("pm2")
	return err == nil
}
