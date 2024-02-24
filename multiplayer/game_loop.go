package multiplayer

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"time"
)

type MessageResult struct {
	Message    *Message
	Err        error
	Statuscode int
}
type ClientPlayer struct {
	Name    string
	IsReady bool
}

const (
	NewGuess       string = "newGuess"
	NewEffect      string = "newEffect"
	PlayerList     string = "playerList"
	PlayerDied     string = "playerDied"
	Join           string = "join"
	Disconnect     string = "disconnect"
	Ready          string = "ready"
	Unready        string = "unready"
	GameStart      string = "gameStart"
	GetEvents      string = "getEvents"
	GetState       string = "getState"
	NoContent      string = "noContent"
	RawText        string = "rawText"
	NestedMessages string = "nestedMessages"
)

func sendEventToOtherPlayers(game *game, playerindex int, message *Message) {
	player_username := game.Players[playerindex].DisplayName
	message.Id = player_username
	for i, player := range game.Players {
		if i != playerindex {
			player.Messages = append(player.Messages, message)
		} else {
			player.LastTime = time.Now()
		}
	}
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
	for _, player := range game.Players {
		if time.Since(player.LastTime) > time.Minute {

		}
	}
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
	var time_check time.Time = time.Now()
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
				Message: &Message{Type: NoContent}, Err: nil,
				Statuscode: http.StatusNoContent}
		case Join:
			if game.HasStarted {
				game.Responses <- MessageResult{Message: nil,
					Err:        errors.New("Game already started"),
					Statuscode: http.StatusConflict,
				}
				break
			}
			response := addPlayer(game, message)
			if response.Err == nil {
				message.Id = response.Message.Jsondata
				sendEventToOtherPlayers(game, len(game.Players)-1, message)
				//TODO assumptions ?
			}
			game.Responses <- response
		case Disconnect:
			player_index, err := getPlayerIndex(game, message)
			if err != nil {
				game.Responses <- MessageResult{Message: nil, Err: err,
					Statuscode: http.StatusBadRequest}
				break
			}
			sendEventToOtherPlayers(game, player_index, message)
			game.Responses <- MessageResult{Message: &Message{Type: NoContent}, Err: err,
				Statuscode: http.StatusNoContent}
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
			if !slices.ContainsFunc(game.Players, func(p *player) bool {
				return p.IsReady == false
			}) {
				game.HasStarted = true
				sendEventToOtherPlayers(game, -1, &Message{
					Type: GameStart,
				})
			}
			game.Responses <- MessageResult{Message: &Message{Type: NoContent}, Err: err,
				Statuscode: http.StatusNoContent}
		case Unready:
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
			game.Players[player_index].IsReady = false
			game.Responses <- MessageResult{Message: &Message{Type: NoContent}, Err: err,
				Statuscode: http.StatusNoContent}
		case GetState:
			current_players := make([]ClientPlayer, 0)
			player_index, err := getPlayerIndex(game, message)
			if err != nil {
				game.Responses <- MessageResult{Message: nil, Err: err,
					Statuscode: http.StatusBadRequest}
			}
			for i, player := range game.Players {
				if i != player_index {
					current_players = append(current_players, ClientPlayer{
						Name: player.DisplayName, IsReady: player.IsReady})
				}
			}
			current_players_json, err := json.Marshal(current_players)
			if err != nil {
				game.Responses <- MessageResult{Message: nil, Err: err,
					Statuscode: http.StatusInternalServerError}
				break
			}
			game.Responses <- MessageResult{Message: &Message{
				Type:     PlayerList,
				Jsondata: string(current_players_json),
			},
				Err:        nil,
				Statuscode: http.StatusOK}
		case GetEvents:
			player_index, err := getPlayerIndex(game, message)
			if err != nil {
				game.Responses <- MessageResult{Message: nil, Err: err,
					Statuscode: http.StatusBadRequest}
                break
			}
            player:=game.Players[player_index]
            messages_json, err:=json.Marshal(player.Messages)
            if err!=nil{
                game.Responses <- MessageResult{Message: nil, Err: err,
                    Statuscode: http.StatusInternalServerError}
                break
            }
            game.Responses <- MessageResult{Message: &Message{
                Type: NestedMessages,
                Jsondata: string(messages_json),
            },
                Err: nil,
                Statuscode: http.StatusOK,
            }
		}

		if time.Since(time_check) > time.Second*30 {
			time_check = time.Now()
			checkPlayerActivity(game)
		}
	}
	for {
		select {
		case <-game.Messages:
			game.Responses <- MessageResult{
				Message:    nil,
				Err:        errors.New("Inactive Game"),
				Statuscode: http.StatusGone,
			}
		case <-time.After(time.Minute):
			removeGame(game.Id)
			return
		}
	}
}
