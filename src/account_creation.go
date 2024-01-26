package src
import (
    "net/http"
    "shrimple/src/templates"
    "context"
)

func AccountCreationHandler(w http.ResponseWriter, r *http.Request) {

    if err:=r.ParseForm(); err!=nil{
        err := templates.ErrorMessage(err.Error()).Render(context.Background(), w)
        if err != nil {
            w.WriteHeader(INTERNAL_SERVER_ERROR)
        }
        return 
    }
    
    var username string = r.FormValue("username")
    var password string = r.FormValue("password")
    var confirmpassword string = r.FormValue("confirmpassword")

    if UsernameTaken(username) {
        err := templates.ErrorMessage("Username Already Taken!").Render(context.Background(), w)
        if err != nil {
            w.WriteHeader(INTERNAL_SERVER_ERROR)
        }
        return
    }

    if password != confirmpassword {
        err := templates.ErrorMessage("Passwords do not match!").Render(context.Background(), w)
        if err != nil {
            w.WriteHeader(INTERNAL_SERVER_ERROR)
            return
        }
    }

    err := CreateUser(username, password)
    if err != nil {
        templates.ErrorMessage("Account Creation Failed").Render(context.Background(), w)
        //w.WriteHeader(INTERNAL_SERVER_ERROR)
    }
    return 
}
