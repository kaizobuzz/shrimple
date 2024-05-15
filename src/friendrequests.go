package src

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"shrimple/src/database"
)

func getIdFromRequest(r *http.Request)(id int64, err error){
    username:=LoggedInUser(r)
    if username==nil{
        return -1, errors.New("request does not have username associated with it")
    }
    id, err=database.SelectIdFromUsername(*username)
    if err!=nil{
        return -1, err
    }
    return id, nil
}

func getUsersForRequests(r *http.Request) (sending_id int64, receiving_id int64, err error) {	
    decoder:=json.NewDecoder(r.Body)
    var target_id int64
    if err:=decoder.Decode(&target_id); err != nil {
        return -1, -1, fmt.Errorf("unable to unmarshal request %v", r)
	}
    user_id, err:=getIdFromRequest(r)
	if err != nil {
		return -1, -1, err
	}
	return user_id, target_id, nil
}

func sendFriendRequest(w http.ResponseWriter, r *http.Request) {
	sending_id, receiving_id, err := getUsersForRequests(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}	
    err=database.UpdateFriendRequests(sending_id, receiving_id, database.SentRequest)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
	//TODO thingy
}
func checkFriendRequests(w http.ResponseWriter, r *http.Request) {
    id, err:=getIdFromRequest(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    request_ids, err:=database.SelectIncomingFriendRequestsFromId(id)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    requests, err:=database.GetUsernameListFromIdList(request_ids)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
    }
	userjson, err := json.Marshal(requests)
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
    err=database.UpdateFriendRequests(sending_user, receiving_user, database.AcceptedRequest)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
	w.WriteHeader(http.StatusOK)
	//TODO send message
}
func rejectFriendRequest(w http.ResponseWriter, r *http.Request) {
    receiving_user, sending_user, err := getUsersForRequests(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}	
    err=database.UpdateFriendRequests(sending_user, receiving_user, database.RejectedRequest)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
	w.WriteHeader(http.StatusOK)
}
