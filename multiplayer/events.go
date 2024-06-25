package multiplayer

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"shrimple/src/shared"
)

const (
	GuessStatusNormal int = iota
	GuessStatusCorrectGuess
	GuessStatusOutofGuesses
)
const MAX_CONTENT_LENGTH=700

func getGameId(r *http.Request) (*game, error) {
	u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
		return nil, err
	}
	id := u.Query().Get("id")
    current_game:=shared.SafeProcessLockedWithReturn(&ActiveGames, func(games map[string]*game)*game {
       return games[id] 
    })
	if id == "" {
		return nil, errors.New("id query is empty")
	}
	if current_game == nil {
		return nil, fmt.Errorf("game with id %s doesn't exist", id)
	}
	//maybe should use 404 instead?
	return current_game, nil
}
func getRequestInfo(
	r *http.Request,
) (game *game, message *Message, err error, statuscode int) {
    if r.ContentLength>MAX_CONTENT_LENGTH{
        return nil, nil, fmt.Errorf("Content length too large: %d, (max %d)", r.ContentLength, MAX_CONTENT_LENGTH), http.StatusBadRequest
    }
	game, err = getGameId(r)
	if err != nil {
		return nil, nil, err, http.StatusGone
	}
    message=&Message{}
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
	if message.Type != MessageTypeJoin {
		log.Println("message type: ", message.Type, " is not join")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	game.Messages <- message
    log.Println("waiting")
	response := <-game.Responses
    log.Println(response)
	if response.Err != nil {
		log.Println(response.Err)
		w.WriteHeader(response.Statuscode)
		if response.Statuscode == http.StatusConflict {
			w.Write([]byte(response.Err.Error()))
		}
		return
	}
	if response.Message.Type != MessageTypeRawText {
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
		if response.Statuscode == http.StatusConflict {
			w.Write([]byte(response.Err.Error()))
		}
		return
	}
	switch response.Message.Type {
	case MessageTypeNoContent:
		w.WriteHeader(http.StatusNoContent)
		return
	case MessageTypePlayerList:
		response_json, err := json.Marshal(response.Message)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		w.Write(response_json)
	default:
		log.Println("response message type: ", response.Message.Type, " is not valid")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}
func CheckForEvents(w http.ResponseWriter, r *http.Request) {
    log.Println(r.ContentLength)
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
	if response.Message.Type != MessageTypeNestedMessages {
		log.Println("response message type: ", response.Message.Type, " is not ", MessageTypeNestedMessages)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write([]byte(response.Message.Jsondata))
}
func GetGameStateEvent(w http.ResponseWriter, r *http.Request){
    game, err:=getGameId(r)
    if err!=nil{
        w.WriteHeader(http.StatusGone)
    }
    message:=&Message{ 
        Type: MessageTypeGetFullState,
        Id: "",
        Jsondata: "",
    }
    game.Messages<-message
    response:=<-game.Responses
    if response.Err!=nil{
        log.Println(err)
        w.WriteHeader(response.Statuscode)
        return
    }
    w.Write([]byte(response.Message.Jsondata))
}
