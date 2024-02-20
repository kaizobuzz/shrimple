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
        NewEffects: make(chan Effects, 15),
        NewGuesses: make(chan Guess, 45)}
}
type game struct{
    p1, p2 player
    status ActiveStatus
    hasError bool
}
var ActiveGames map[string]*game
var ActiveGamesMutex sync.Mutex
var NextGameId string
func removeGame(id string){
    ActiveGamesMutex.Lock() 
    defer ActiveGamesMutex.Unlock()
    delete(ActiveGames, id)
}
func checkPlayerActivity(signal chan struct{}, id string){
    Loop: for{
        select{
            case <-signal:
                break
            case <-time.After(time.Minute*2):
                removeGame(id)
                break Loop
        } 
    }
}
func checkActivity(status *ActiveStatus, gameid string){
    go checkPlayerActivity(status.last_p1_signal, gameid)
    go checkPlayerActivity(status.last_p2_signal, gameid)
}
func makeNewGame(){
    ActiveGamesMutex.Lock()
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
    ActiveGames[NextGameId]=new_game
    checkActivity(&new_game.status, NextGameId)
    for ActiveGames[NextGameId]!=nil{
        NextGameId=fmt.Sprintf("%d", rand.Uint64())
    }
}
func GiveNewGameId(w http.ResponseWriter, r *http.Request){  
    new_game_id:=NextGameId
    go makeNewGame()
    w.Write([]byte(new_game_id))     
}
func IntializeMap(){
    ActiveGames=make(map[string]*game)
    NextGameId=fmt.Sprintf("%d", rand.Uint64());
}
