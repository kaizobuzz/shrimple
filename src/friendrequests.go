package src

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"shrimple/src/database"
)

type SelectionRequest func(string) ([]string, error)

func getIdFromRequest(r *http.Request)(id string, err error){
    user_id:=LoggedInUser(r)
    if user_id==nil{
        return "", errors.New("request does not have username associated with it")
    } 
    return *user_id, nil
}

func getUsersForRequests(r *http.Request) (sending_id string, receiving_id string, err error) {	
    decoder:=json.NewDecoder(r.Body)
    var target_id string
    if err:=decoder.Decode(&target_id); err != nil {
        return "", "", fmt.Errorf("unable to unmarshal request %v", r)
	}
    user_id, err:=getIdFromRequest(r)
	if err != nil {
		return "", "", err
	}
	return user_id, target_id, nil
}

//TODO also needs csrf protection
func sendFriendRequest(w http.ResponseWriter, r *http.Request) {
	sending_id, receiving_id, err := getUsersForRequests(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}	
    if (sending_id==receiving_id){
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    if err:=database.UpdateFriendRequests(sending_id, receiving_id, database.SentRequest); err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

func getUsernameIdJsonFromIdList(ids []string)([]byte, error){
    pairs, err:=database.GetUsernameListFromIdList(ids)
    if err!=nil{
        return nil, err
    }
    pairs_json, err:=json.Marshal(pairs)
    if err!=nil{
        return nil, err
    }
    return pairs_json, nil
}

func getUsernameIdJsonFromId(id string, request SelectionRequest)([]byte, error){
    ids, err:=request(id)
    if err!=nil{
        return nil, err
    }
    return getUsernameIdJsonFromIdList(ids)
}

func checkIncomingFriendRequests(w http.ResponseWriter, r *http.Request) {
    id, err:=getIdFromRequest(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    request_json, err:=getUsernameIdJsonFromId(id, database.SelectIncomingFriendRequestsFromId)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    } 
	w.Write(request_json)
}
func checkOutgoingFriendRequests(w http.ResponseWriter, r *http.Request){
    id, err:=getIdFromRequest(r)
    if err!=nil{
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    requests_json, err:=getUsernameIdJsonFromId(id, database.SelectOutgoingFriendRequestsFromId)
    if err!=nil{
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.Write(requests_json)
}
func checkFriends(w http.ResponseWriter, r *http.Request){
    id, err:=getIdFromRequest(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    friends_json, err:=getUsernameIdJsonFromId(id, database.SelectFriendsFromId)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.Write(friends_json) 
}

//TODO these probably actually need csrf protection
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
	w.WriteHeader(http.StatusNoContent)
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
	w.WriteHeader(http.StatusNoContent)
}


