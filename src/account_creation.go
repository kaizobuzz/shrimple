package src
import (
    "net/http"
    "shrimple/src/templates"
)

func AccountCreationHandler(w http.ResponseWriter, r *http.Request) {

    if err:=r.ParseForm(); err!=nil{
        err := templates.UseStringTemplate(err.Error(), templates.ErrorMessage, &w)
        if err != nil {
            w.WriteHeader(INTERNAL_SERVER_ERROR)
        }
        return 
    }
    
    var username string = r.FormValue("username")
    var password string = r.FormValue("password")
    var confirmpassword string = r.FormValue("confirmpassword")

    if UsernameTaken(username) {
        err := templates.UseStringTemplate("Username Already Taken!", templates.ErrorMessage, &w)
        if err != nil {
            w.WriteHeader(INTERNAL_SERVER_ERROR)
        }
        return
    }

    if password != confirmpassword {
        err := templates.UseStringTemplate("Passwords do not match!", templates.ErrorMessage, &w)
        if err != nil {
            w.WriteHeader(INTERNAL_SERVER_ERROR)
        }
        return
    }

    err := CreateUser(username, password)
    if err != nil {
        templates.UseStringTemplate("Account Creation Failed", templates.ErrorMessage, &w)
        //w.WriteHeader(INTERNAL_SERVER_ERROR)
    }
    return 
}
