package src

import (
	"encoding/json"
	"net/http"
	"shrimple/src/shared"
    "log"
)

type GuessHistoryEntry struct {
	GameMode   string
	GuessDate  int64
	NumGuesses int
}
type GuessHistoryRequest struct{
    GameMode string
    UserId int
}

func GuessHistoryEntryReciever(w http.ResponseWriter, r *http.Request) {
	//get the logged in user
	var username *string = LoggedInUser(r)
	if username == nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	//decode the json from the request
	var historyentry *GuessHistoryEntry = &GuessHistoryEntry{}
	var decoder *json.Decoder = json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(historyentry)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// store the decoded data in the user's struct
	var user *User = GetUserByName(*username)
	mode_guess_history, has_mode := user.GuessHistory[historyentry.GameMode]
	if !has_mode {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, already_played_that_day := mode_guess_history[historyentry.GuessDate]
	if already_played_that_day {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	mode_guess_history[historyentry.GuessDate] = historyentry.NumGuesses

	// return the guess history for that gamemode back to the user
	var guess_history_response map[int]int64 = make(map[int]int64)
	for _, value := range mode_guess_history {
		guess_history_response[value]++
	}

	bytes, err := json.Marshal(guess_history_response)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
    if err:=WriteUsersToFile(); err!=nil{
        log.Println(err)
        //TODO might change or will stay if changed to using database
    }
	w.Write(bytes)
}

func GetGuessHistoryEntry(w http.ResponseWriter, r *http.Request) {
    var history_request *GuessHistoryRequest = &GuessHistoryRequest{}
	var decoder *json.Decoder = json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(history_request)
    if err!=nil{
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    var user *User
    if history_request.UserId==-1{
        var username *string = LoggedInUser(r)
	    if username == nil {
		    w.WriteHeader(http.StatusBadRequest)
		    return
	    }   
	    user= GetUserByName(*username)
    } else{
        user=shared.SafeProcessLockedWithReturn(&UserMap, func(user_map map[int64]*User)*User {
            return user_map[int64(history_request.UserId)]}) 
    }
    if user==nil{
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    mode_guess_history, has_mode := user.GuessHistory[history_request.GameMode]
	if !has_mode {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var guess_history_response map[int]int64 = make(map[int]int64)
	for _, value := range mode_guess_history {
		guess_history_response[value]++
	}

	bytes, err := json.Marshal(guess_history_response)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}

