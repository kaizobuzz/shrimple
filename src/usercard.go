package src
import (
    "net/http"
    "fmt"
)

func UserCardHandler(w http.ResponseWriter, r *http.Request) {
    //TODO: this function was written to test stuff and is therefore put together rather sloppily
    var user *string = LoggedInUser(r)  
    if user == nil {
        // not logged in
        w.Write([]byte("Not Logged In"))
    } else {
        // logged in user
        w.Write([]byte(fmt.Sprintf("Logged In as %s", *user)))
    }
}
