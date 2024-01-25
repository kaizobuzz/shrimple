package src
import (
    "net/http"
    "log"
)
func AccountCreationHandler(w http.ResponseWriter, r *http.Request) error {
    if err:=r.ParseForm(); err!=nil{
        log.Fatal(err)
    }
    var username string = r.FormValue("username")
    var password string = r.FormValue("password")
    err := CreateUser(username, password)
    if err != nil {
        //TODO: render error clientside
    }
    return nil
}
