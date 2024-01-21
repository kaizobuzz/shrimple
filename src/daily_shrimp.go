package src

import (
	"fmt"
	"net/http"
	//"io"
	"encoding/json"
	"math/rand"
	"os"
	"time"
)
type ShrimpData struct {
    Name string
    Habitat string
    Length_male json.Number 
    Length_female json.Number 
    Coloration string
}
type ShrimpJson struct {
    Shrimps []ShrimpData
}
func DailyShrimpName(w http.ResponseWriter, r *http.Request){
    mode := r.URL.Query().Get("mode")
    if mode == "shrimple" {
        shrimps_json, err := os.ReadFile("data/shrimps.json")
        fmt.Println(json.Valid(shrimps_json));
        if err != nil {
            w.WriteHeader(500) // internal server error
            return
        }
        var shrimplist ShrimpJson
        err = json.Unmarshal(shrimps_json, &shrimplist)
        fmt.Println(shrimplist);
        if err != nil {
            w.WriteHeader(500) // internal server error
            return
        }
        s := rand.NewSource(time.Now().UTC().UnixMilli()/(1000 * 60 * 60 * 24))
        r := rand.New(s)
        println("NUMBER OF SHRIMPS ",  len(shrimplist.Shrimps))
        i := r.Intn(len(shrimplist.Shrimps))
        w.Write([]byte(shrimplist.Shrimps[i].Name))
        
    } else if mode == "clamplicated" {
        w.WriteHeader(501) // not implemented
    } else if mode == "shrimpossible" {
        w.WriteHeader(501) // not implemented
    } else {
        w.WriteHeader(400)
    }
}
