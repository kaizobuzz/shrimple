package src

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"net/http"
)

type account struct {
	hashed_password          string
	experience               int
	friends                  []string
	outgoing_friend_requests []string
	incoming_friend_requests []string
}

var accountmap map[string]*account

func hashPassword(username, password string) string {
	password = password + "somepepperprobablytodoandalsotheesalt"
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

func createAccount(username, password string) error {
	if accountmap[username] != nil {
		return errors.New("Account already exists")
	}
	hash := hashPassword(username, password)
	accountmap[username] = &account{
		hashed_password:          hash,
		experience:               0, //TODO
		friends:                  make([]string, 0),
		outgoing_friend_requests: make([]string, 0),
		incoming_friend_requests: make([]string, 0),
	}
	//also need to write the password somewhere ofc
	return nil
}
func accCreationHandler(w http.ResponseWriter, r *http.Request) error {
	if err := r.ParseForm(); err != nil {
		log.Fatal(err)
	}
	username := r.FormValue("username")
	password := r.FormValue("password")
    //also need a confirmation thing
	err := createAccount(username, password)
	if err != nil {
		//TODO also need to like yknow actually render stuff
	}
	return nil
}
func verifyPassword(username, password string) bool {
	hash := hashPassword(username, password)
	if accountmap[username].hashed_password == hash {
		return true
	}
	return false
}
