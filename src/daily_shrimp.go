package src

import (
	"fmt"
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

func DailyShrimpName(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("mode")
	u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
		w.WriteHeader(INTERNAL_SERVER_ERROR)
		return
	}
	mode = u.Query().Get("mode")
	if mode == "shrimple" {
		shrimps_json, err := os.ReadFile("data/shrimps.json")
		fmt.Println(json.Valid(shrimps_json))
		if err != nil {
			w.WriteHeader(INTERNAL_SERVER_ERROR) // internal server error
			return
		}
		var shrimplist ShrimpJson
		err = json.Unmarshal(shrimps_json, &shrimplist)
		fmt.Println(shrimplist)
		if err != nil {
			w.WriteHeader(INTERNAL_SERVER_ERROR) // internal server error
			return
		}
		s := rand.NewSource(time.Now().UTC().UnixMilli() / (1000 * 60 * 60 * 24))
		r := rand.New(s)
		println("NUMBER OF SHRIMPS ", len(shrimplist.Shrimps))
		i := r.Intn(len(shrimplist.Shrimps))
		w.Write([]byte(shrimplist.Shrimps[i].Name))

	} else if mode == "clamplicated" {
		w.WriteHeader(NOT_IMPLEMENTED) // not implemented
	} else if mode == "shrimpossible" {
		w.WriteHeader(NOT_IMPLEMENTED) // not implemented
	} else {
		w.WriteHeader(BAD_REQUEST)
	}
}
