package src

import (
	"log"
	"net/http"
	"net/url"

	//"io"
	"math/rand"
	"shrimple/src/shared"
	"time"
)
func getBaseDailyNumber(offset int64) int{
    s:=rand.NewSource((time.Now().UTC().UnixMilli()/(1000*60*60*24))+offset)
    r:=rand.New(s) 
    return r.Intn(len(shared.ShrimpList.Shrimps))
}
func DailyShrimpName(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("mode")
	u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	mode = u.Query().Get("mode")
	if mode == "shrimple" {
		i := getBaseDailyNumber(0)
		w.Write([]byte(shared.ShrimpList.Shrimps[i].Name))
	} else if mode == "clamplicated" {
        i := getBaseDailyNumber(17)
        w.Write([]byte(shared.ShrimpList.Shrimps[i].Name))
	} else if mode == "shrimpossible" {
		w.WriteHeader(http.StatusNotImplemented) // not implemented
	} else {
		w.WriteHeader(http.StatusBadRequest)
	}
}
