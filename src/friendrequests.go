package src

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"slices"
)
func unstableDelete[T comparable](slice []T, value T)([]T, error){
    index:=slices.Index(slice, value)
    if (index==-1){
        return slice, errors.New(fmt.Sprint("value: ", value, "not found in slice: ", slice))
    }
    slice[index]=slice[len(slice)-1]
    return slice[:len(slice)-1], nil
}
func getCurrentUser(r *http.Request) (user *User, err error){
    username:=LoggedInUser(r)
    if username==nil{
        return nil, errors.New("user does not have valid session token")
    }
    user=GetUserByName(*username)
    if user==nil{
        return nil, errors.New(fmt.Sprint("username ",username," despite having a session token does not correspond to any user"))
    }
    return user, nil
}
func getUsersForRequests(r *http.Request) (user *User, target *User, err error){
    if err:=r.ParseForm(); err!=nil{
        return nil, nil, err
    }
    target_username:=r.FormValue("username")
    target_user:=GetUserByName(target_username)
    if target_user!=nil{
        return nil, nil, errors.New(fmt.Sprint("target username: ",target_username,"is invalid"))
    }
    user, err=getCurrentUser(r)
    if err!=nil{
        return nil, nil, err
    }
    return user, target_user, nil
}

func sendFriendRequest(w http.ResponseWriter, r *http.Request){
    user, target_user, err:=getUsersForRequests(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    if slices.Contains(user.OutgoingFriendRequests, target_user.Id){ 
        w.WriteHeader(http.StatusUnprocessableEntity)
    }
    user.OutgoingFriendRequests=append(user.OutgoingFriendRequests, target_user.Id)
    target_user.IncomingFriendRequests = append(target_user.IncomingFriendRequests, user.Id)
    if err:=WriteUsersToFile(); err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusOK)
    //TODO thingy
}
func checkFriendRequests(w http.ResponseWriter, r *http.Request){
    user, err:=getCurrentUser(r) 
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    log.Println(user)
    var users []string=make([]string, 0)
    //TODO need to get other usernames from id
    userjson, err:=json.Marshal(users)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.Write(userjson)
}
func acceptFriendRequest(w http.ResponseWriter, r *http.Request){
    receiving_user, sending_user, err:=getUsersForRequests(r) 
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    receiving_user.IncomingFriendRequests, err=unstableDelete(receiving_user.IncomingFriendRequests, sending_user.Id)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusConflict)
        return
    }
    sending_user.OutgoingFriendRequests, err=unstableDelete(sending_user.OutgoingFriendRequests, receiving_user.Id)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusConflict)
        return
    }
    receiving_user.Friends = append(receiving_user.Friends, sending_user.Id)
    sending_user.Friends = append(sending_user.Friends, receiving_user.Id)
    if err:=WriteUsersToFile(); err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusOK)
    //TODO send message
}
