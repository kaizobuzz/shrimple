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
		s := rand.NewSource(time.Now().UTC().UnixMilli() / (1000 * 60 * 60 * 24))
		r := rand.New(s)
		log.Println("NUMBER OF SHRIMPS ", len(shared.ShrimpList.Shrimps))
		i := r.Intn(len(shared.ShrimpList.Shrimps))
		w.Write([]byte(shared.ShrimpList.Shrimps[i].Name))
	} else if mode == "clamplicated" {
		w.WriteHeader(http.StatusNotImplemented) // not implemented
	} else if mode == "shrimpossible" {
		w.WriteHeader(http.StatusNotImplemented) // not implemented
	} else {
		w.WriteHeader(http.StatusBadRequest)
	}
}
