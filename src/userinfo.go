package src

import (
    "net/http"
    "net/url"
    "log"
    "shrimple/src/templates"
    "context"
)


func UserInfoHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("Getting User Info!")
    user_id, err:=getUserIdRefererVal(r)
    if err != nil {
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    //TODO handle this error
    user, err:= GetUserById(user_id);
    if err != nil {
        log.Println(err)
        w.Write([]byte("No User With That ID!!"))
        return
    }
    templates.UserInfo(user).Render(context.Background(), w) 
}
