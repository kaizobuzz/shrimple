package src

import (
	"errors"
	"log"
	"net/http"
	"shrimple/src/templates"
)

const _MAXIMUM_USERNAME_LENGTH = 60

func createAccount(username, password, confirmpassword string) error {
	taken, err := UsernameTaken(username)
	if err != nil {
		log.Println(err)
		return errors.New("Check for username failed")
	}
	if taken {
		return errors.New("Username Already Taken!")
	}
	if password != confirmpassword {
		return errors.New("Passwords do not match!")
	}
	err = CreateUser(username, password)
	if err != nil {
		log.Println(err)
		return errors.New("Account Creation Failed")
	}
	return nil
}

// TODO check if there is a possible denial of service attack by spamming this endpoint
func AccountCreationHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
		err := templates.UseStringTemplate("Failed to parse form", templates.ErrorMessage, &w)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	var username string = r.FormValue("username")
	var password string = r.FormValue("password")
	var confirmpassword string = r.FormValue("confirmpassword")
	err := createAccount(username, password, confirmpassword)
	if err != nil {
		err = templates.UseStringTemplate(err.Error(), templates.ErrorMessage, &w)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	{
		cookie, err := CreateCookieFromUsername(username)
		if err != nil {
			log.Println(err)
		} else {
			http.SetCookie(w, cookie)
		}
	}
	err = templates.UseStringTemplate("Account created successfully", templates.SuccessMessage, &w)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	return
}
