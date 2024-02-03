package src

import (
	"log"
	"net/http"
	"net/url"

	//"io"
	"encoding/json"
	"math/rand"
	"os"
	"time"
)


type ShrimpData struct {
	Name          string
	Habitat       string
    Length        json.Number
	Coloration    []string
    Weight        json.Number
    MaxDepth      json.Number
}
type ShrimpJson struct {
	Shrimps []ShrimpData
}

const SHRIMP_DATA_PATH="static/data/shrimps.json"
var ShrimpList ShrimpJson

func GetShrimpJson() error{
    shrimps_json, err:=os.ReadFile(SHRIMP_DATA_PATH)
    if err!=nil{
        return err
    }
    err = json.Unmarshal(shrimps_json, &ShrimpList)
    log.Println("shrimplist: ", ShrimpList) 
    return nil
}
func DailyShrimpName(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("mode")
	u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
        log.Println(err)
		w.WriteHeader(INTERNAL_SERVER_ERROR)
		return
	}
	mode = u.Query().Get("mode")
	if mode == "shrimple" {
		s := rand.NewSource(time.Now().UTC().UnixMilli() / (1000 * 60 * 60 * 24))
		r := rand.New(s)
		log.Println("NUMBER OF SHRIMPS ", len(ShrimpList.Shrimps))
		i := r.Intn(len(ShrimpList.Shrimps))
		w.Write([]byte(ShrimpList.Shrimps[i].Name))
	} else if mode == "clamplicated" {
		w.WriteHeader(NOT_IMPLEMENTED) // not implemented
	} else if mode == "shrimpossible" {
		w.WriteHeader(NOT_IMPLEMENTED) // not implemented
	} else {
		w.WriteHeader(BAD_REQUEST)
	}
}
