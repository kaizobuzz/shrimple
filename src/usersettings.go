package src

import (
	"encoding/json"
	"net/http"
	"shrimple/src/database"
)


func checkForAuth(w http.ResponseWriter, r *http.Request) {
	id := LoggedInUser(r)
	if id == nil {
        http.Redirect(w, r, "/login.html", http.StatusSeeOther)
		return
	}
    w.WriteHeader(http.StatusNoContent)
}

func getPrivacySettings(w http.ResponseWriter, r *http.Request){
    user_id:=LoggedInUser(r)
    if user_id==nil{
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    settings, err:=database.SelectSettingsFromId(*user_id)
    if err!=nil{
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    privacy_bytes, err:=json.Marshal(settings.Privacy)
    if err != nil{
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.Write(privacy_bytes)
}


