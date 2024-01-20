package src

import (
	"net/http"
	"os"
)
func GetShrimps(w http.ResponseWriter, r *http.Request){
    shrimps_json, err := os.ReadFile("data/shrimps.json")
    if err != nil {
        w.WriteHeader(500) // internal server error
        return
    }
    w.Write(shrimps_json);
}
