package src
import(
    "net/http"
    //"io"
    "os"
    "encoding/json"
    "math/rand"
    "time"
)
type ShrimpData struct {
    name string
    habitat string
    length_male json.Number 
    length_female json.Number 
    coloration string
}
type ShrimpJson struct {
    shrimps []ShrimpData
}
func DailyShrimpName(w http.ResponseWriter, r *http.Request){
    /*mode_bytes, err := io.ReadAll(r.Body)
    var mode string = string(mode_bytes)
    r.Body.Close()
    if err != nil {
        w.WriteHeader(500)
        return
    }*/
    mode := "shrimple"
    if mode == "shrimple" {
        shrimps_json, err := os.ReadFile("data/shrimps.json")
        if err != nil {
            w.WriteHeader(500) // internal server error
            return
        }
        var shrimplist ShrimpJson
        err = json.Unmarshal(shrimps_json, &shrimplist)
        if err != nil {
            w.WriteHeader(500) // internal server error
            return
        }
        s := rand.NewSource(time.Now().UTC().UnixMilli() % (1000 * 60 * 60 * 24))
        r := rand.New(s)
        println("NUMBER OF SHRIMPS ",  len(shrimplist.shrimps))
        i := r.Intn(len(shrimplist.shrimps))
        w.Write([]byte(shrimplist.shrimps[i].name))
        
    } else if mode == "clamplicated" {
        w.WriteHeader(501) // not implemented
    } else if mode == "shrimpossible" {
        w.WriteHeader(501) // not implemented
    } else {
        w.WriteHeader(400)
    }
}
