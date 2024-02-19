package multiplayer

import (
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"
    "sync/atomic"
)
const NUM_SHRIMP_FIELDS uint=6
type ActiveStatus struct{
    last_p1_signal, last_p2_signal chan struct{} 
    is_active atomic.Bool
}
type Guess struct{
    Results[NUM_SHRIMP_FIELDS]GuessResults
    Status GuessStatus
}
type player struct{
    NewEffects chan Effects 
    NewGuesses chan Guess
    //these are both from the opponent as the own could be handled client side  
}
func give_default_player() player{
    return player{
        NewEffects: make(chan Effects, 10),
        NewGuesses: make(chan Guess, 20)}
}
type game struct{
    p1, p2 player
    status ActiveStatus
    hasError bool
}
var ActiveGames map[string]*game
var ActiveGamesMutex sync.Mutex

func checkPlayerActivity(signal chan struct{}, active *atomic.Bool){
    Loop: for{
        select{
            case <-signal:
                break
            case <-time.After(time.Minute*2):
                active.Store(false) 
                break Loop
        } 
    }
}
func checkActivity(status *ActiveStatus){
    go checkPlayerActivity(status.last_p1_signal, &status.is_active)
    go checkPlayerActivity(status.last_p2_signal, &status.is_active)
}
func makeNewGame(new_game_id string){
    defer ActiveGamesMutex.Unlock()
    new_game:=&game{
        p1: give_default_player(),
        p2: give_default_player(),
        status: ActiveStatus{
            last_p1_signal: make(chan struct{}),
            last_p2_signal: make(chan struct{}),
        },
        hasError: false,
    }
    ActiveGames[new_game_id]=new_game
    checkActivity(&new_game.status)
}
func GiveNewGameId(w http.ResponseWriter, r *http.Request){ 
    var new_game_id string
    new_game_id=fmt.Sprintf("%d", rand.Uint64());
    ActiveGamesMutex.Lock()
    for ActiveGames[new_game_id]!=nil{
        new_game_id=fmt.Sprintf("%d", rand.Uint64());
    }
    go makeNewGame(new_game_id)
    w.Write([]byte(new_game_id))     
}
func IntializeMap(){
    ActiveGames=make(map[string]*game)
}
