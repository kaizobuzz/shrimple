package src

import (
	"encoding/json"
	"log"
	"net/http"
	"shrimple/src/database"
)

type GuessHistoryEntry struct {
	GameMode   string
	GuessDate  int64
	NumGuesses int
}
type GuessHistoryRequest struct {
	GameMode string
	UserId   int64
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
	guess_history, err := database.SelectGuessHistoryFromUsername(*username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	mode_guess_history, has_mode := guess_history[historyentry.GameMode]
	if !has_mode {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	//TODO maybe a hard cutoff for guess date or just compare it to the latest (if this is done then it'll probably be better stored as a 6 length array with an extra field of last guess date, where the date is set on the time of creation of the object)
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
	if err := database.UpdateGuessHistoryWithUsername(*username, guess_history); err != nil {
		log.Println(err)
		//TODO idk
	}
	w.Write(bytes)
}

func GetGuessHistoryEntry(w http.ResponseWriter, r *http.Request) {
	var history_request *GuessHistoryRequest = &GuessHistoryRequest{}
	var decoder *json.Decoder = json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(history_request)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var guess_history map[string]map[int64]int
	if history_request.UserId == -1 {
		var username *string = LoggedInUser(r)
		if username == nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		guess_history, err = database.SelectGuessHistoryFromUsername(*username)
	} else {
		guess_history, err = database.SelectGuessHistoryFromId(history_request.UserId)
	}
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	mode_guess_history, has_mode := guess_history[history_request.GameMode]
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
