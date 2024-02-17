package multiplayer

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)
type GuessResults int 
const (
    Correct GuessResults=iota
    Incorrect 
    TooLarge
    TooSmall
    PartialEqual
    UnknownComparison
)
type Effects int 
const (
    GuessStatHide Effects=iota 
    TimeLimitMinus    
    RequiredClick
    NoAutofill  
    ShrimpGarbage
    BombParty
)
const CONTENT_TYPE="Content-Type" 
const JSON_HEADER="application/json"
const PLAYER_1="1"
const PLAYER_2="2"
func getGameInfo(r *http.Request)(error, *game, string){
    u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
		return err, nil, ""
	}
    id := u.Query().Get("id")
    player := u.Query().Get("p")
    currentgame:=active_games[id]
    if id==""{
        return errors.New("id query is empty"), nil, ""
    }
    if player!=PLAYER_2&&player!=PLAYER_1{
        return errors.New(fmt.Sprint("player: ", player, "is not ", PLAYER_1, "or ", PLAYER_2)), nil, ""
    }
    if currentgame==nil{
        return errors.New(fmt.Sprint("game with id", id, "doesn't exist")), nil, ""
    }
    //maybe should use 404 instead?
    return nil, currentgame, player 
}
func AddNewEvents(w http.ResponseWriter, r *http.Request){
    //id := r.URL.Query().Get("gameid")
    //player := r.URL.Query().Get("player")
    err, game, playerid:=getGameInfo(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    } 
    if err:=r.ParseForm(); err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    var receivingplayer *player 
    if playerid==PLAYER_1{
        receivingplayer=&game.p2
        game.status.mu.Lock()
        game.status.last_p1_signal=time.Now()
        game.status.mu.Unlock()
    } else{
        receivingplayer=&game.p1 
        game.status.mu.Lock()
        game.status.last_p2_signal=time.Now()
        game.status.mu.Unlock()
    }
    receivingplayer.hasUnrenderedEvents=true
    events:=strings.Split(r.FormValue("events"), " ")
    for _, event:=range events{
        eventnum, err:=strconv.Atoi(event)
        if err!=nil{
            log.Println(err)
            game.hasError=true
            w.WriteHeader(http.StatusInternalServerError)
            return
        }
        receivingplayer.newEffects = append(receivingplayer.newEffects, Effects(eventnum))
    }
    guesses:=strings.Split(r.FormValue("guesses"), ",")
    for _, guess:=range guesses{
        guess_results:=strings.Split(guess, " ")
        var new_guess [NUM_SHRIMP_FIELDS]GuessResults;
        for i, guess_result:=range guess_results{
            guess_result_num, err:=strconv.Atoi(guess_result)
            if err!=nil{
                log.Println(err)
                game.hasError=true
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            new_guess[i]=GuessResults(guess_result_num)
        }
        receivingplayer.newGuesses=append(receivingplayer.newGuesses, new_guess)
    }
}
func CheckForEvents(w http.ResponseWriter, r *http.Request){
    err, game, playerid:=getGameInfo(r)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    if err:=r.ParseForm(); err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    var checking_player *player 
    if playerid==PLAYER_1{
        checking_player=&game.p1
        game.status.mu.Lock()
        game.status.last_p1_signal=time.Now()
        game.status.mu.Unlock()
    } else{
        checking_player=&game.p2 
        game.status.mu.Lock()
        game.status.last_p2_signal=time.Now()
        game.status.mu.Unlock()
    }
    jsonbytes, err:=json.Marshal(checking_player)
    log.Println(jsonbytes)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
    }
    w.Header().Set(CONTENT_TYPE, JSON_HEADER)
    w.Write(jsonbytes)
    checking_player.newEffects=make([]Effects, 0)
    checking_player.newGuesses=make([][NUM_SHRIMP_FIELDS]GuessResults, 0)
    checking_player.shouldClearBoard=false
    checking_player.hasUnrenderedEvents=false
}
