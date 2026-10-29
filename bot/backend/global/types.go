package global

type UserInfo struct {
	TelegramID int `json:"telegram_id"`
}

type BalanceMinusInfo struct {
	TelegramID int     `json:"telegram_id"`
	Amount     float64 `json:"amount"`
}

type ClickInfo struct {
	TelegramID int     `json:"telegram_id"`
	ClickCount int `json:"click_count"`
	X int `json:"x"`
}

type BuyToquesInfo struct {
	TelegramID int `json:"telegram_id"`
}

type SetToques struct {
	TelegramID int `json:"telegram_id"`
	NewToques  int `json:"new_toques"`
}

type SetBalance struct {
	TelegramID int `json:"telegram_id"`
	NewBalance int `json:"new_balance"`
}

type SetEnergy struct {
	TelegramID int `json:"telegram_id"`
	NewEnergy  int `json:"new_energy"`
}
