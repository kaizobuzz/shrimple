package src

import (
    "net/http"
    "net/url"
    "log"
    "shrimple/src/templates"
    "strconv"
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
    user_id_string := u.Query().Get("userid")
    var user_id int64;
    user_id, err = strconv.ParseInt(user_id_string, 10, 64)

    var user *User = GetUserById(user_id);

    if user != nil {
        templates.UserInfo(GetUserById(user_id)).Render(context.Background(), w)
    }else {
        w.Write([]byte("No User With That ID!!"))
    }
    
}
