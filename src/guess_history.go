package src

import (
	"encoding/json"
	"log"
	"net/http"
	"shrimple/src/database"
	"shrimple/src/shared"
)

type GuessHistoryEntry struct {
	GameMode   string
	GuessDate  int64
	NumGuesses int
}
type GuessHistoryRequest struct {
	GameMode string
	UserId   string
}

func GuessHistoryEntryReciever(w http.ResponseWriter, r *http.Request) {
	//get the logged in user
	var id *string = LoggedInUser(r)
	if id == nil {
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
	guess_history, err := database.SelectGuessHistoryFromId(*id)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	mode_guess_history, has_mode := guess_history[historyentry.GameMode]
	if !has_mode {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if mode_guess_history.LastDate >= historyentry.GuessDate {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if historyentry.GuessDate > shared.GetCurrentDate() {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if historyentry.NumGuesses > len(mode_guess_history.Guesses) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if historyentry.NumGuesses >= 0 {
		mode_guess_history.Guesses[historyentry.NumGuesses-1]++
	} else {
		mode_guess_history.FailedShrimple++
	}

	// return the guess history for that gamemode back to the user
	var guess_history_response map[int]int64 = make(map[int]int64)
	for i, value := range mode_guess_history.Guesses {
		guess_history_response[i] = int64(value + 1)
	}
	guess_history_response[-1] = int64(mode_guess_history.FailedShrimple)

	bytes, err := json.Marshal(guess_history_response)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := database.UpdateGuessHistoryWithId(*id, guess_history); err != nil {
		log.Println(err)
	}
	w.Write(bytes)
}

func GetGuessHistoryEntry(w http.ResponseWriter, r *http.Request) {
	var history_request *GuessHistoryRequest = &GuessHistoryRequest{}
	var decoder *json.Decoder = json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(history_request)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var guess_history map[string]GuessHistory
	if history_request.UserId == "" {
		var id *string = LoggedInUser(r)
		if id == nil {
			log.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		guess_history, err = database.SelectGuessHistoryFromId(*id)
	} else {
		settings, err := database.SelectSettingsFromId(history_request.UserId)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if !settings.Privacy.Page.ViewGuessHistory {
			w.WriteHeader(http.StatusForbidden)
			return
		}
        if allowed, _:=checkAuthToViewWithSettings(r, history_request.UserId, settings); !allowed{
            w.WriteHeader(http.StatusForbidden)
            return
        }
		//TODO check for privacy settings
		guess_history, err = database.SelectGuessHistoryFromId(history_request.UserId)
	}
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	mode_guess_history, has_mode := guess_history[history_request.GameMode]
	if !has_mode {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var guess_history_response map[int]int64 = make(map[int]int64)
	for i, value := range mode_guess_history.Guesses {
		guess_history_response[i+1] = int64(value)
	}
	guess_history_response[-1] = int64(mode_guess_history.FailedShrimple)
	bytes, err := json.Marshal(guess_history_response)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}
