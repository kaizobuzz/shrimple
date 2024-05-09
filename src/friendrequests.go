package src

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"shrimple/src/database"
	"slices"
)

func getCurrentUser(r *http.Request) (user *User, err error) {
	username := LoggedInUser(r)
	if username == nil {
		return nil, errors.New("user does not have valid session token")
	}
	user = GetUserByName(*username)
	if user == nil {
		return nil, fmt.Errorf(
			"username %s despite having a session token does not correspond to any user",
			*username,
		)
	}
	return user, nil
}
func getUsersForRequests(r *http.Request) (user *User, target *User, err error) {
	if err := r.ParseForm(); err != nil {
		return nil, nil, err
	}
	target_username := r.FormValue("username")
	target_user := GetUserByName(target_username)
	if target_user != nil {
		return nil, nil, fmt.Errorf("target username: %s is invalid", target_username)
	}
	user, err = getCurrentUser(r)
	if err != nil {
		return nil, nil, err
	}
	return user, target_user, nil
}

func sendFriendRequest(w http.ResponseWriter, r *http.Request) {
	user, target_user, err := getUsersForRequests(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if slices.Contains(user.OutgoingFriendRequests, target_user.Id) {
		w.WriteHeader(http.StatusUnprocessableEntity)
	}
    err=database.UpdateFriendRequests(user.Id, target_user.Id, database.SentRequest)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
	//TODO thingy
}
func checkFriendRequests(w http.ResponseWriter, r *http.Request) {
	user, err := getCurrentUser(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	log.Println(user)
	var users []string = make([]string, 0)
	//TODO need to get other usernames from id
	userjson, err := json.Marshal(users)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(userjson)
}
func acceptFriendRequest(w http.ResponseWriter, r *http.Request) {
	receiving_user, sending_user, err := getUsersForRequests(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}	
    err=database.UpdateFriendRequests(sending_user.Id, receiving_user.Id, database.AcceptedRequest)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
	w.WriteHeader(http.StatusOK)
	//TODO send message
}
