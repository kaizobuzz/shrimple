package multiplayer

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
)

type GuessResults int8

const (
	Correct GuessResults = iota
	Incorrect
	TooLarge
	TooSmall
	PartialEqual
	UnknownComparison
)

type Effects int8

const (
	GuessStatHide Effects = iota
	TimeLimitMinus
	RequiredClick
	NoAutofill
	ShrimpGarbage
	BombParty
)

type GuessStatus int8

const (
	Normal GuessStatus = iota
	CorrectGuess
	OutofGuesses
)

const CONTENT_TYPE = "Content-Type"
const JSON_HEADER = "application/json"
const PLAYER_1 = "1"
const PLAYER_2 = "2"

func getGameId(r *http.Request) (*game, error) {
	u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
		return nil, err
	}
	id := u.Query().Get("id")
	ActiveGamesLock.Lock()
	currentgame := ActiveGames[id]
	ActiveGamesLock.Unlock()
	if id == "" {
		return nil, errors.New("id query is empty")
	}
	if currentgame == nil {
		return nil, errors.New(fmt.Sprint("game with id", id, "doesn't exist"))
	}
	//maybe should use 404 instead?
	return currentgame, nil
}
func getRequestInfo(
	r *http.Request,
) (game *game, message *Message, err error, statuscode int) {
	game, err = getGameId(r)
	if err != nil {
		return nil, nil, err, http.StatusGone
	}
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err = decoder.Decode(message)
	if err != nil {
		return nil, nil, err, http.StatusBadRequest
	}
	return game, message, nil, statuscode
}
func getNewPlayerId(w http.ResponseWriter, r *http.Request) {
	game, message, err, statuscode := getRequestInfo(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(statuscode)
		return
	}
	if message.Type != "join" {
		log.Println("message type: ", message.Type, " is not join")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	game.Messages <- message
	response := <-game.Responses
	if response.Err != nil {
		log.Println(response.Err)
		w.WriteHeader(response.Statuscode)
		if response.Statuscode == http.StatusConflict {
			w.Write([]byte(response.Err.Error()))
		}
		return
	}
	if response.Message.Type != RawText {
		log.Println(
			"response message type: ",
			response.Message.Type,
			" for joining is not raw text",
		)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write([]byte(response.Message.Jsondata))
}

func AddNewEvent(w http.ResponseWriter, r *http.Request) {
	game, message, err, statuscode := getRequestInfo(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(statuscode)
		return
	}
	game.Messages <- message
	response := <-game.Responses
	if response.Err != nil {
		log.Println(response.Err)
		w.WriteHeader(response.Statuscode)
		return
	}
	switch response.Message.Type {
	case NoContent:
		w.WriteHeader(http.StatusNoContent)
		return
	//TODO
	default:
		log.Println("response message type: ", response.Message.Type, " is not valid")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}
func CheckForEvents(w http.ResponseWriter, r *http.Request) {
	game, message, err, statuscode := getRequestInfo(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(statuscode)
		return
	}
	game.Messages <- message
	response := <-game.Responses
	if response.Err != nil {
		log.Println(response.Err)
		w.WriteHeader(response.Statuscode)
		return
	}
	if response.Message.Type != NestedMessages {
		log.Println("response message type: ", response.Message.Type, " is not ", NestedMessages)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write([]byte(response.Message.Jsondata))
}
