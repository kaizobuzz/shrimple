package src

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"net/http"
	"os"
	"shrimple/src/shared"
	"shrimple/src/templates"
	"time"
    "encoding/json"
)
var pepper string

func hashPassword(username, password string) string{
    if len(pepper)==0{
        log.Fatal(errors.New("pepper too short (0 chars)"))
    }
    password=password+pepper
    hash:=sha256.Sum256([]byte(password))
    return hex.EncodeToString(hash[:])
}

func verifyPassword(username, password string) bool{
    hash:=hashPassword(username, password)
    if UserMap[username].PasswordHash==hash{
        return true;
    }
    return false;
}
func GetPepper(){
    pepperbyte, err:=os.ReadFile("data/pepper")
    pepper=string(pepperbyte);
    if len(pepper)==0{
        log.Fatal(errors.New("pepper too short (0 chars)"))
    }
    if err!=nil{
        log.Fatal(err)
    }
}

func LoginHandler(w http.ResponseWriter, r *http.Request) { 
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

    if !verifyPassword(username, password){
        err := templates.UseStringTemplate("Incorrect Credentials", templates.ErrorMessage, &w)
        if err != nil {
            log.Println(err)
            w.WriteHeader(shared.INTERNAL_SERVER_ERROR)
        }
        return //this return is kinda important
    }
    
    // generate token
    var expiration = time.Now().Add(time.Hour * 24)
    token, err := Tokenfromdata(TokenData{username: username, expiration: expiration})
    if err != nil {
        err := templates.UseStringTemplate("Failed to create auth token", templates.ErrorMessage, &w)
        if err != nil {
            log.Println(err)
            w.WriteHeader(shared.INTERNAL_SERVER_ERROR)
        }
        return
    }      
    
    json_token, err := json.Marshal(token)  
    if err != nil {
        err := templates.UseStringTemplate("Failed to serialize auth token", templates.ErrorMessage, &w)
        if err != nil {
            log.Println(err)
            w.WriteHeader(shared.INTERNAL_SERVER_ERROR)
        }
        return
    }

    var cookie = http.Cookie{
        Name: "sessiontoken",
        Value: string(json_token),
        Path: "/",
        MaxAge: 86400,
        HttpOnly: false,
        Secure: false,
        SameSite: http.SameSiteLaxMode,
    };

    err = templates.UseStringTemplate("You are now logged in!", templates.SuccessMessage, &w)
    if err != nil {
        log.Println(err)
        w.WriteHeader(shared.INTERNAL_SERVER_ERROR)
        return
    }

    http.SetCookie(w, &cookie)
    return
}
