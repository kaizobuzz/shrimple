package multiplayer

import (
	"math/rand"
	"net/http"
	"shrimple/src/shared"
	"time"
)

func RandomShrimpName(w http.ResponseWriter, _ *http.Request){
    s:=rand.NewSource(time.Now().UnixNano())
    r:=rand.New(s)
    i:=r.Intn(len(shared.ShrimpList.Shrimps));   
    w.Write([]byte(shared.ShrimpList.Shrimps[i].Name))
}
