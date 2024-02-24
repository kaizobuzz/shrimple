package multiplayer

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"slices"
	"sync"
	"time"
)

const NUM_SHRIMP_FIELDS uint = 6

type Message struct {
	Type     string
	Id       string
	Jsondata string
}
type Guess struct {
	Results [NUM_SHRIMP_FIELDS]GuessResults
	Status  GuessStatus
}
type player struct {
	Messages    chan *Message
	DisplayName string
	Userid      string
	LastTime    time.Time
	IsReady     bool
	//these are both from the opponent as the own could be handled client side
}
type MessageResult struct {
	Message    *Message
	Err        error
	Statuscode int
}

const (
	NewGuess   string = "newGuess"
	NewEffect  string = "newEffect"
	PlayerDied string = "playerDied"
	Join       string = "join"
	Disconnect string = "disconnect"
	Ready      string = "ready"
	Unready    string = "unready"
	GetEvents  string = "getEvents"
	GetState   string = "getState"
	NoContent  string = "noContent"
	RawText    string = "rawText"
)

func getNewEmptyPlayer() player {
	return player{
		Messages: make(chan *Message, 40),
		LastTime: time.Now(),
	}
}

type game struct {
	Players    []*player
	HasError   bool
	HasStarted bool
	Messages   chan *Message
	Responses  chan MessageResult
}

var ActiveGames map[string]*game
var ActiveGamesLock sync.Mutex
var NextGameId string

func removeGame(id string) {
	ActiveGamesLock.Lock()
	defer ActiveGamesLock.Unlock()
	delete(ActiveGames, id)
}
func getPlayerIndex(game *game, message *Message) (int, error) {
	player_index := slices.IndexFunc(game.Players, func(p *player) bool {
		return p.Userid == message.Id
	})
	if player_index == -1 {
		return player_index, errors.New(
			fmt.Sprint("request with id: ", message.Id, " not found in: ", game.Players),
		)
	}
	return player_index, nil
}
func checkPlayerActivity(game *game) {
}
func addPlayer(game *game, message *Message) MessageResult {
	var display_name string
	err := json.Unmarshal([]byte(message.Jsondata), &display_name)
	if err != nil {
		return MessageResult{
			Message:    nil,
			Err:        nil,
			Statuscode: http.StatusBadRequest,
		}
	}
	if slices.ContainsFunc(game.Players, func(p *player) bool {
		return p.DisplayName == display_name
	}) {
		return MessageResult{
			Message:    nil,
			Err:        errors.New("Name already taken"),
			Statuscode: http.StatusConflict,
		}
	}
	new_player := getNewEmptyPlayer()
	new_player.DisplayName = display_name
	display_sum := sha256.Sum256([]byte(new_player.DisplayName + "rainbowprotection"))
	new_player.Userid = base64.StdEncoding.EncodeToString(display_sum[:])
	game.Players = append(game.Players, &new_player)
	return MessageResult{
		Message: &Message{
			Type:     RawText,
			Jsondata: new_player.Userid,
		},
		Err:        nil,
		Statuscode: http.StatusOK,
	}
}
func checkActivity(game *game) {
Loop:
	for {
		var message *Message
		select {
		case message = <-game.Messages:
			break
		case <-time.After(time.Minute):
			break Loop
		}
		switch message.Type {
		case NewGuess, NewEffect, PlayerDied:
			player_index, err := getPlayerIndex(game, message)
			if err != nil {
				game.Responses <- MessageResult{Message: nil, Err: err,
					Statuscode: http.StatusBadRequest}
				break
			}
			sendEventToOtherPlayers(game, player_index, message)
			game.Responses <- MessageResult{
				Message:    &Message{Type: NoContent}, Err: nil,
				Statuscode: http.StatusNoContent}
		case Join:
			if game.HasStarted {
				game.Responses <- MessageResult{Message: nil,
					Err:        errors.New("Game already started"),
					Statuscode: http.StatusConflict,
				}
			}
			game.Responses <- addPlayer(game, message)
			//TODO send event somehow
		case Disconnect:

		case Ready:
			if game.HasStarted {
				game.Responses <- MessageResult{Message: nil,
					Err:        errors.New("Game already started"),
					Statuscode: http.StatusConflict,
				}
			}
			player_index, err := getPlayerIndex(game, message)
			if err != nil {
				game.Responses <- MessageResult{Message: nil, Err: err,
					Statuscode: http.StatusBadRequest}
				break
			}
            sendEventToOtherPlayers(game, player_index, message)
            //Same functionality as below until this point
			game.Players[player_index].IsReady = true
			//TODO check if all players are ready
		case Unready:

		case GetState:
			/*player_index, err:=getPlayerIndex(game, message)
			  if err!=nil{
			      game.Responses <-MessageResult{message: nil, err: err,
			          statuscode: http.StatusBadRequest}
			  }
			  for _, player:=range game.Players{

			  }*/
		case GetEvents:

		}
		checkPlayerActivity(game)
	}

}
func makeNewGame() {
	ActiveGamesLock.Lock()
	defer ActiveGamesLock.Unlock()
	new_game := &game{
		Players:  make([]*player, 0),
		HasError: false,
		Messages: make(chan *Message),
	}
	ActiveGames[NextGameId] = new_game
	go checkActivity(new_game)
	for ActiveGames[NextGameId] != nil {
		NextGameId = fmt.Sprintf("%d", rand.Uint64())
	}
}
func GiveNewGameId(w http.ResponseWriter, r *http.Request) {
	new_game_id := NextGameId
	w.Write([]byte(new_game_id))
	makeNewGame()
}
func IntializeMap() {
	ActiveGames = make(map[string]*game)
	NextGameId = fmt.Sprintf("%d", rand.Uint64())
}
