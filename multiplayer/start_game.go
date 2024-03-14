package multiplayer

import (
	"fmt"
	"math/rand"
	"net/http"
	"shrimple/src/shared"
	"time"
)

const NUM_SHRIMP_FIELDS uint = 6
const MAX_LIVES uint = 3

type Message struct {
	Type     int
	Id       string
	Jsondata string
}

func (m *Message) clone() Message {
	return Message{
		Type:     m.Type,
		Id:       m.Id,
		Jsondata: m.Jsondata,
	}
}

type Guess struct {
	Results [NUM_SHRIMP_FIELDS]uint8
	Status  GuessStatus
}

type player struct {
	Messages     []*Message
	VotedAgainst []string
	Guesses      []Guess
	Lives        uint
	DisplayName  string
	Userid       string
	LastTime     time.Time
	IsReady      bool
}

func getNewEmptyPlayer() player {
	return player{
		Messages:     make([]*Message, 0),
		VotedAgainst: make([]string, 0),
		Guesses:      make([]Guess, 0),
		Lives:        MAX_LIVES,
		LastTime:     time.Now(),
	}
}

type game struct {
	Id         string
	Players    []player
	HasError   bool
	HasStarted bool
	Messages   chan *Message
	Responses  chan MessageResult
}

var ActiveGames shared.Locked[map[string]*game]
var NextGameId string

func removeGame(id string) {
    ActiveGames.SafeProcessInner (func(games_map map[string]*game){
	    delete(games_map, id)
    })
}
func makeNewGame() {
    active_games:=ActiveGames.SafeAccessInner()
	defer ActiveGames.Lock.Unlock()
	new_game := &game{
		Id:        NextGameId,
		Players:   make([]player, 0),
		HasError:  false,
		Messages:  make(chan *Message),
		Responses: make(chan MessageResult),
	}
	active_games[NextGameId] = new_game
	go checkActivity(new_game)
	source := rand.NewSource(time.Now().UnixNano())
	for active_games[NextGameId] != nil {
		NextGameId = fmt.Sprintf("%d", source.Int63())
	}
}
func GiveNewGameId(w http.ResponseWriter, r *http.Request) {
	new_game_id := NextGameId
	w.Write([]byte(new_game_id))
	makeNewGame()
}
func IntializeMap() {
	ActiveGames = shared.Locked[map[string]*game]{Value: make(map[string]*game)}
	NextGameId = fmt.Sprintf("%d", rand.Uint64())
}
