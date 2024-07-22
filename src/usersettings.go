package src

import (
	"encoding/json"
	"log"
	"net/http"
	"shrimple/src/database"
	"shrimple/src/shared"
)


func checkForAuth(w http.ResponseWriter, r *http.Request) {
	id := LoggedInUser(r)
	if id == nil {
        http.Redirect(w, r, "/login.html", http.StatusSeeOther)
		return
	}
    w.WriteHeader(http.StatusNoContent)
}

func getSettings(w http.ResponseWriter, r *http.Request){
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
    settings_bytes, err:=json.Marshal(settings)
    if err != nil{
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.Write(settings_bytes)
}

func changeSettings(w http.ResponseWriter, r *http.Request){
    user_id:=LoggedInUser(r)
    if user_id==nil{
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    decoder:=json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields()
    var settings shared.Settings
    if err:=decoder.Decode(&settings); err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    if err:=database.UpdateSettingsWithId(*user_id, settings); err!=nil{
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
    return
}
