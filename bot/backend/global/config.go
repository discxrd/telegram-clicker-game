package global

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
)

type Config struct {
	Token                   string `json:"token"`
	ChatID                  string `json:"chat_id"`
	AlertChatID             string `json:"alert_chat_id"`
	AppMarket               string `json:"app_market"`
	Text                    string `json:"text"`
	WelcomeButtonText       string `json:"welcome_button_text"`
	URL                     string `json:"url"`
	BaseURL                 string `json:"BASE_URL"`
	WebhookSecret           string `json:"webhook_secret"`
	EnergyRecoveryInterval  int    `json:"energyRecoveryInterval"`
	EnergyRecoveryAmount    int    `json:"energyRecoveryAmount"`
	SubscriptionBonusEnergy int    `json:"subscriptionBonusEnergy"`
}

var (
	AppConfig      Config
	loadConfigErr  error
	loadConfigOnce sync.Once
)

func LoadConfig() (Config, error) {
	loadConfigOnce.Do(func() {
		AppConfig, loadConfigErr = loadConfig()
	})

	return AppConfig, loadConfigErr
}

func loadConfig() (Config, error) {
	config := Config{
		EnergyRecoveryInterval:  60,
		EnergyRecoveryAmount:    1,
		SubscriptionBonusEnergy: 20,
		AppMarket:               "portugal",
	}

	if err := loadConfigFile(&config); err != nil {
		return Config{}, err
	}

	overrideString(&config.Token, "BOT_TOKEN")
	overrideString(&config.ChatID, "CHAT_ID")
	overrideString(&config.AlertChatID, "ALERT_CHAT_ID")
	overrideString(&config.AppMarket, "APP_MARKET")
	overrideString(&config.Text, "WELCOME_TEXT")
	overrideString(&config.WelcomeButtonText, "WELCOME_BUTTON_TEXT")
	overrideString(&config.URL, "APP_URL")
	overrideString(&config.BaseURL, "BASE_URL")
	overrideString(&config.WebhookSecret, "WEBHOOK_SECRET")

	var err error
	config.EnergyRecoveryInterval, err = envInt("ENERGY_RECOVERY_INTERVAL_SECONDS", config.EnergyRecoveryInterval)
	if err != nil {
		return Config{}, err
	}

	config.EnergyRecoveryAmount, err = envInt("ENERGY_RECOVERY_AMOUNT", config.EnergyRecoveryAmount)
	if err != nil {
		return Config{}, err
	}

	config.SubscriptionBonusEnergy, err = envInt("SUBSCRIPTION_BONUS_ENERGY", config.SubscriptionBonusEnergy)
	if err != nil {
		return Config{}, err
	}

	config.URL = strings.TrimSpace(config.URL)
	config.BaseURL = strings.TrimRight(strings.TrimSpace(firstNonEmpty(config.BaseURL, config.URL)), "/")
	config.ChatID = strings.TrimSpace(config.ChatID)
	config.AlertChatID = strings.TrimSpace(firstNonEmpty(config.AlertChatID, "6885853129"))
	config.WebhookSecret = strings.TrimSpace(firstNonEmpty(config.WebhookSecret, "charonchiki"))
	config.AppMarket, err = normalizeAppMarket(config.AppMarket)
	if err != nil {
		return Config{}, err
	}
	applyWelcomeDefaults(&config)

	if config.Token == "" {
		return Config{}, fmt.Errorf("missing BOT_TOKEN")
	}
	if config.URL == "" {
		return Config{}, fmt.Errorf("missing APP_URL")
	}
	if config.ChatID == "" {
		return Config{}, fmt.Errorf("missing CHAT_ID")
	}

	return config, nil
}

func normalizeAppMarket(market string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(market)) {
	case "", "portugal":
		return "portugal", nil
	case "france":
		return "france", nil
	default:
		return "", fmt.Errorf("invalid APP_MARKET value %q: expected portugal or france", market)
	}
}

func applyWelcomeDefaults(config *Config) {
	if strings.TrimSpace(config.Text) == "" {
		config.Text = defaultWelcomeText(config.AppMarket)
	}

	if strings.TrimSpace(config.WelcomeButtonText) == "" {
		config.WelcomeButtonText = defaultWelcomeButtonText(config.AppMarket)
	}
}

func defaultWelcomeText(market string) string {
	switch market {
	case "france":
		return "🚀 Bienvenue sur le bot Renault\n\nAppuyez sur l'écran aussi souvent que possible pour gagner de l'argent réel et le transférer sur votre carte bancaire. C'est simple et accessible à tous !\n\n✅ Essayez dès maintenant"
	default:
		return "🚀 Bem-vindo ao bot da Volkswagen\n\nToque no ecrã o mais vezes possível para\nganhar dinheiro real e transferi-lo para a sua conta bancária.\n\n✅ É simples e acessível a todos! Experimente agora mesmo"
	}
}

func defaultWelcomeButtonText(market string) string {
	switch market {
	case "france":
		return "💥 Commencez à gagner de l'argent"
	default:
		return "💥 Começar a ganhar"
	}
}

func loadConfigFile(config *Config) error {
	configPath := strings.TrimSpace(os.Getenv("CONFIG_JSON_PATH"))
	if configPath == "" {
		configPath = "config.json"
	}

	file, err := os.Open(configPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return fmt.Errorf("failed to open config file: %w", err)
	}
	defer file.Close()

	if err := json.NewDecoder(file).Decode(config); err != nil {
		return fmt.Errorf("failed to decode config file: %w", err)
	}

	return nil
}

func overrideString(target *string, key string) {
	if value, ok := os.LookupEnv(key); ok {
		*target = strings.TrimSpace(value)
	}
}

func envInt(key string, fallback int) (int, error) {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback, nil
	}

	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return 0, fmt.Errorf("invalid %s value %q: %w", key, value, err)
	}

	return parsed, nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}

	return ""
}

func (c Config) PublicBaseURL() string {
	return strings.TrimRight(strings.TrimSpace(firstNonEmpty(c.BaseURL, c.URL)), "/")
}

func (c Config) AvatarURL(userID int) string {
	return fmt.Sprintf("%s/get_avatar?telegram_id=%d", c.PublicBaseURL(), userID)
}
