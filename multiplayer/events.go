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
type GuessStatus int 
const (
    Normal GuessStatus=iota
    CorrectGuess
    OutofGuesses
)
type PlayerForJson struct{
    NewGuesses []Guess
    NewEffects []Effects
}
const CONTENT_TYPE="Content-Type" 
const JSON_HEADER="application/json"
const PLAYER_1="1"
const PLAYER_2="2"
func makeJsonPlayer(player *player) PlayerForJson{
    var guess Guess
    var newGuesses []Guess
    var effect Effects
    var newEffects []Effects
    Loop: for{
        select{
            case guess=<-player.NewGuesses: 
                newGuesses = append(newGuesses, guess)
            case effect=<-player.NewEffects:
                newEffects=append(newEffects, effect)
            default:
                break Loop
        }
    }
    return PlayerForJson{NewGuesses: newGuesses, NewEffects: newEffects}
}
func getGameInfo(r *http.Request)(error, *game, string){
    u := &url.URL{}
	err := u.UnmarshalBinary([]byte(r.Referer()))
	if err != nil {
		return err, nil, ""
	}
    id := u.Query().Get("id")
    player := u.Query().Get("p")
    ActiveGamesMutex.Lock()
    currentgame:=ActiveGames[id] 
    ActiveGamesMutex.Unlock()
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
func AddNewEvent(w http.ResponseWriter, r *http.Request){
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
        game.status.last_p1_signal<-struct{}{}
    } else{
        receivingplayer=&game.p1 
        game.status.last_p2_signal<-struct{}{}
    }
    event:=r.FormValue("event")
    if event!=""{
        eventnum, err:=strconv.Atoi(event)
        if err!=nil{
            log.Println(err)
            game.hasError=true
            w.WriteHeader(http.StatusInternalServerError)
            return
        }
        receivingplayer.NewEffects <- Effects(eventnum)
        return
    }
    guessvalue:=r.FormValue("guess")
    if guessvalue!=""{
        guess, guess_status, _:=strings.Cut(guessvalue, ",")
        guess_status_num, err:=strconv.Atoi(guess_status)
        if err!=nil{
            log.Println(err)
            game.hasError=true 
            w.WriteHeader(http.StatusInternalServerError)
            return
        }
        guess_results:=strings.Split(guess, " ")
        var new_guess [NUM_SHRIMP_FIELDS]GuessResults
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
        receivingplayer.NewGuesses <-(Guess{
            Results: new_guess, 
            Status: GuessStatus(guess_status_num)})
        return
    }
    w.WriteHeader(http.StatusBadRequest)
}
func CheckForEvents(w http.ResponseWriter, r *http.Request){
    log.Println("checking")
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
        game.status.last_p1_signal<-struct{}{}
    } else{
        checking_player=&game.p2 
        game.status.last_p2_signal<-struct{}{}
    }
    jsonbytes, err:=json.Marshal(makeJsonPlayer(checking_player))
    log.Println(jsonbytes)
    if err!=nil{
        log.Println(err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    w.Header().Set(CONTENT_TYPE, JSON_HEADER)
    w.Write(jsonbytes)
}
