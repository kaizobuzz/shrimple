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
        fmt.Println("Logged in user: *nil")
        w.Write([]byte("Not Logged In"))
    } else {
        // logged in user
        fmt.Printf("Logged in user: %s", *user)
        w.Write([]byte(fmt.Sprintf("Logged In as %s", *user)))
    }
}
