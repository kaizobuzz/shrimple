package multiplayer

import (
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"
)
const NUM_SHRIMP_FIELDS uint=6
type ActiveStatus struct{
    mu sync.Mutex
    last_p1_signal, last_p2_signal time.Time 
    is_active bool
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
        NewEffects: make(chan Effects, 5),
        NewGuesses: make(chan Guess, 15)}
}
type game struct{
    p1, p2 player
    status ActiveStatus
    hasError bool
}
var active_games map[string]*game

func checkActivity(status *ActiveStatus){
    for{
        time.Sleep(time.Second*30)
        status.mu.Lock()
        if time.Now().Sub(status.last_p1_signal)>time.Minute||time.Now().Sub(status.last_p2_signal)>time.Minute{
            status.is_active=false
            break;
        }
        status.mu.Unlock()
        //alternatively just use the close checking from javascript
    }
}

func GiveNewGameId(w http.ResponseWriter, r *http.Request){
    var new_game_id string
    new_game_id=fmt.Sprintf("%d", rand.Uint64());
    for active_games[new_game_id]!=nil{
        new_game_id=fmt.Sprintf("%d", rand.Uint64());
    }
    active_games[new_game_id]=&game{
        p1: give_default_player(),
        p2: give_default_player(),
        status: ActiveStatus{
            last_p1_signal: time.Now(),
            last_p2_signal: time.Now(),
            is_active: true,
        },
        hasError: false,
    }
    go checkActivity(&active_games[new_game_id].status)
    w.Write([]byte(new_game_id))     
}

func IntializeMap(){
    active_games=make(map[string]*game)
}
