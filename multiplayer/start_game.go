package multiplayer

import (
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

const NUM_SHRIMP_FIELDS uint = 6
const MAX_LIVES uint = 3

type Message struct {
	Type     uint8
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

var ActiveGames map[string]*game
var ActiveGamesLock sync.Mutex
var NextGameId string

func removeGame(id string) {
	ActiveGamesLock.Lock()
	defer ActiveGamesLock.Unlock()
	delete(ActiveGames, id)
}
func makeNewGame() {
	ActiveGamesLock.Lock()
	defer ActiveGamesLock.Unlock()
	new_game := &game{
		Id:        NextGameId,
		Players:   make([]player, 0),
		HasError:  false,
		Messages:  make(chan *Message),
		Responses: make(chan MessageResult),
	}
	ActiveGames[NextGameId] = new_game
	go checkActivity(new_game)
	source := rand.NewSource(time.Now().UnixNano())
	for ActiveGames[NextGameId] != nil {
		NextGameId = fmt.Sprintf("%d", source.Int63())
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
