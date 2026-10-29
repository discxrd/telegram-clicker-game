package funcs

import (
	"net/http"
)

func ServeFrontend(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    w.Header().Set("Pragma", "no-cache")
    w.Header().Set("Expires", "0")
	
	fs := http.FileServer(http.Dir("./front"))
	fs.ServeHTTP(w, r)
}
