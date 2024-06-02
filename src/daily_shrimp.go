package src


import (
	"log"
	"net/http"
	"net/url"

	//"io"
	"math/rand"
	"shrimple/src/shared"
)
const SHRIMPLE_GAMEMODE_SHRIMPLE string = "shrimple"
const SHRIMPLE_GAMEMODE_CLAMPLICATED string = "clamplicated"
const SHRIMPLE_GAMEMODE_SHRIMPOSSIBLE string = "shrimpossible"

var SHRIMPLE_GAMEMODES = [...]string{
    SHRIMPLE_GAMEMODE_SHRIMPLE,
    SHRIMPLE_GAMEMODE_CLAMPLICATED,
    SHRIMPLE_GAMEMODE_SHRIMPOSSIBLE,
}

func getBaseDailyNumber(offset int64) int{
    offset = ((offset >> 16) ^ offset) * 0x119de1f3;
    offset = ((offset >> 16) ^ offset) * 0x119de1f3;
    offset = (offset >> 16) ^ offset;
    s:=rand.NewSource((shared.GetCurrentDate())^offset)     
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
	if mode == SHRIMPLE_GAMEMODE_SHRIMPLE {
		i := getBaseDailyNumber(0)
		w.Write([]byte(shared.ShrimpList.Shrimps[i].Name))
	} else if mode == SHRIMPLE_GAMEMODE_CLAMPLICATED {
        i := getBaseDailyNumber(0x124985798294f0)
        w.Write([]byte(shared.ShrimpList.Shrimps[i].Name))
	} else if mode == SHRIMPLE_GAMEMODE_SHRIMPOSSIBLE {
		w.WriteHeader(http.StatusNotImplemented) // not implemented
	} else {
		w.WriteHeader(http.StatusBadRequest)
	}
}
