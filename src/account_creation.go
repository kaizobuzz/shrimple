package src

import (
	"log"
	"net/http"
	"shrimple/src/templates"
    "shrimple/src/shared"
    "errors"
)
func createAccount(username, password, confirmpassword string) error{
    if UsernameTaken(username){
        return errors.New("Username Already Taken!")
    }
    if password!=confirmpassword{
        return errors.New("Passwords do not match!")
    }
    err:=CreateUser(username, password)
    if err!=nil{
        log.Println(err)
        return errors.New("Account Creation Failed") 
    }
    return nil
}

func AccountCreationHandler(w http.ResponseWriter, r *http.Request) {
    if err:=r.ParseForm(); err!=nil{
        log.Println(err)
        err := templates.UseStringTemplate("Failed to parse form", templates.ErrorMessage, &w)
        if err != nil {
            log.Println(err)
            w.WriteHeader(shared.INTERNAL_SERVER_ERROR)
        }
        return 
    } 
    var username string = r.FormValue("username")
    var password string = r.FormValue("password")
    var confirmpassword string = r.FormValue("confirmpassword")
    err:=createAccount(username, password, confirmpassword)
    if err!=nil{
        err=templates.UseStringTemplate(err.Error(), templates.ErrorMessage, &w)
        if err!=nil{
            log.Println(err)
            w.WriteHeader(shared.INTERNAL_SERVER_ERROR)
        }
    }
    return 
}
