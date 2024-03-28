package src

import (
    "net/http"
    "net/url"
    "log"
)

func UserInfoHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("Getting User Info!")
    u := &url.URL{}
    err := u.UnmarshalBinary([]byte(r.Referer()))
    if err != nil {
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    user_id := u.Query().Get("userid")
    
    w.Write([]byte(user_id))
}
