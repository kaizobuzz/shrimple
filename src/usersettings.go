package src

import (
	"log"
	"net/http"
)

func getUserSettings(w http.ResponseWriter, r *http.Request){
    user_id, err:=getUserIdRefererVal(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    user, err:=GetUserById(user_id)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    username:=LoggedInUser(r)
    if username==nil{
        w.WriteHeader(http.StatusForbidden)
        return
    }
    if (user.Username!=*username){
        w.WriteHeader(http.StatusForbidden)
        return
    }
}
