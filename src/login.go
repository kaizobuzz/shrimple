package src

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"shrimple/src/database"
	"shrimple/src/shared"
	"shrimple/src/templates"
	"time"

	"golang.org/x/crypto/argon2"
)

var _Pepper string
type HashSalt =shared.HashSalt


func randomSecret(length uint32) ([]byte, error) {
	secret := make([]byte, length)

	_, err := rand.Read(secret)
	if err != nil {
		return nil, err
	}
	return secret, nil
}
//TODO figure out good numbers for these
const (
    _SALT_LEN=16
    _ARGON2_TIME=3
    _ARGON2_MEMORY=16*1024
    _ARGON2_THREADS=2
    _ARGON2_KEYLENGTH=32
)
func GeneratePassword(password string)(*HashSalt, error){
    salt, err:=randomSecret(_SALT_LEN)
    if err!=nil{
        return nil, err
    }
    return hashPassword(salt, password), nil
}

//always returns a non nil hashsalt
func hashPassword(salt []byte, password string)(*HashSalt){
	if len(_Pepper) == 0 {
		log.Fatal(errors.New("pepper too short (0 chars)"))
	}
	password = password + _Pepper
    hash:=argon2.IDKey([]byte(password), salt, _ARGON2_TIME, _ARGON2_MEMORY, _ARGON2_THREADS, _ARGON2_KEYLENGTH)
    return &HashSalt{Salt: salt, Hash: hash}
}

func verifyPassword(username string, password string) bool {
    database_hash, err := database.SelectAuthenticationFieldsFromUsername(username)
	if err != nil {
        return false
	}
	hash := hashPassword(database_hash.Salt, password)
	if bytes.Equal(database_hash.Hash, hash.Hash) {
		return true
	}
	return false
}
func GetPepper() {
    //TODO this should be done in a more secure way
	pepperbyte, err := os.ReadFile("data/pepper")
	_Pepper = string(pepperbyte)
	if len(_Pepper) == 0 {
		log.Fatal(errors.New("pepper too short (0 chars)"))
	}
	if err != nil {
		log.Fatal(err)
	}
}

func CreateCookie(username string) (*http.Cookie, error) {
	var expiration = time.Now().Add(time.Hour * 24)

	signed_password, err := SignedPassword(username)
	if err != nil {
		return nil, err
	}
	token, err := Tokenfromdata(
		TokenData{Username: username, Expiration: expiration, Signed_password: signed_password},
	)
	if err != nil {
		return nil, errors.New("Failed to create auth token")
	}

	json_token, err := json.Marshal(token)
	if err != nil {
		return nil, errors.New("Failed to serialize auth token")
	}
	fmt.Printf("\n Sent Session with json value: %s (%x)\n", json_token, json_token)

	var base64_token string = base64.StdEncoding.EncodeToString(json_token)

	var cookie = http.Cookie{
		Name:     "sessiontoken",
		Value:    base64_token,
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: false,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}
	return &cookie, nil
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
		err := templates.UseStringTemplate("Failed to parse form", templates.ErrorLoginForm, &w)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	var username string = r.FormValue("username")
	var password string = r.FormValue("password")

	if !verifyPassword(username, password) {
		err := templates.UseStringTemplate("Incorrect Credentials", templates.ErrorLoginForm, &w)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return //this return is kinda important
	}

	// generate token
	cookie, err := CreateCookie(username)
	if err != nil {
		err := templates.UseStringTemplate(err.Error(), templates.ErrorLoginForm, &w)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	http.SetCookie(w, cookie)

	err = templates.UseStringTemplate("You are now logged in!", templates.SuccessMessage, &w)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	return
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	var cookie = http.Cookie{
		Name:     "sessiontoken",
		Value:    "",
		Path:     "/",
        Expires: time.Unix(0, 0),
		HttpOnly: false,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	};
    
    http.SetCookie(w, &cookie)
    http.Redirect(w, r, "/", http.StatusSeeOther)
}

func LoggedInUser(r *http.Request) *string {
	cookie, err := r.Cookie("sessiontoken")
	if err != nil {
		fmt.Print("error getting session token")
		return nil
	}

	username, valid, err := VerifySessionToken(cookie.Value)
	if err != nil {
		fmt.Printf("error verifying session token: %s", err)
		return nil
	}

	if !valid {
		fmt.Print("invalid session token")
		return nil
	}

	return username
}
