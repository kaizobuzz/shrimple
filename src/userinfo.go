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
    u := &url.URL{}
    err := u.UnmarshalBinary([]byte(r.Referer()))
    if err != nil {
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    user_id := u.Query().Get("userid")
    //TODO handle this error

    user, err:= GetUserById(user_id);
    //TODO also handle this error
    if err == nil {
        templates.UserInfo(user).Render(context.Background(), w)
    }else {
        log.Println(err)
        w.Write([]byte("No User With That ID!!"))
    }
    
}
