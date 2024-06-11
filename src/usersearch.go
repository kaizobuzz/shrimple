package src

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"shrimple/src/database"
)
const _EMPTY_ARRAY="[]"

func parseUserInput(r *http.Request)(input string, err error){
    decoder:=json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields()
    if err=decoder.Decode(&input); err!=nil{
        return "", err
    }
    if len(input)>_MAXIMUM_USERNAME_LENGTH{
        return "", fmt.Errorf("input %d longer than maximum username length %d", len(input), _MAXIMUM_USERNAME_LENGTH)
    }
    return input, nil

}

func getUserList(r *http.Request, w http.ResponseWriter){
    input, err:=parseUserInput(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    } 
    usernames, err:=database.SearchForUsernames(input)
    if err!=nil{
        log.Println(err)
        w.Write([]byte(_EMPTY_ARRAY));
        return
    }
    username_json, err:=json.Marshal(usernames)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
    }
    w.Write(username_json)
    
}
