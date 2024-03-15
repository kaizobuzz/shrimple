package src

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"shrimple/src/templates"
	"time"
)

var pepper string

func hashPassword(username, password string) string {
	if len(pepper) == 0 {
		log.Fatal(errors.New("pepper too short (0 chars)"))
	}
	password = password + pepper + username
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

func verifyPassword(username, password string) bool {
	hash := hashPassword(username, password)
	var user = GetUserByName(username)
	if user == nil {
		return false
	}
	if user.PasswordHash == hash {
		return true
	}
	return false
}
func GetPepper() {
	pepperbyte, err := os.ReadFile("data/pepper")
	pepper = string(pepperbyte)
	if len(pepper) == 0 {
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
