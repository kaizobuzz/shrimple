package multiplayer

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"shrimple/src/shared"
	"slices"
	"time"
)

type MessageResult struct {
	Message    *Message
	Err        error
	Statuscode int
}
type ClientStartPlayer struct {
	Name    string
	IsReady bool
}
type ClientPlayer struct {
	Name    string
	IsReady bool
	Guesses []Guess
	Lives   uint
}

const (
	NewGuess int = iota
	NewEffect
	PlayerList
	PlayerDied
	Join
	Disconnect
	Ready
	Unready
	GameStart
	GetEvents
	GetStartState
	NoContent
	RawText
	NestedMessages
	GetFullState
	FullGameState
	VoteKick
	Kick
	SendChat
)
const (
	DisplayNameTaken   string = "Display name taken"
	GameAlreadyStarted string = "Game already started"
	GameNotStarted     string = "Game not started"
)

func sendEventToOtherPlayers(game *game, playerindex int, message *Message) {
	sending_message := message.clone()
	if playerindex != -1 {
		player_displayname := game.Players[playerindex].DisplayName
		sending_message.Id = player_displayname
	}
	for i, player := range game.Players {
		if i != playerindex {
			player.Messages = append(player.Messages, &sending_message)
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
		return player_index, fmt.Errorf(
			"request with id: %s not found in: %+v",
			message.Id,
			game.Players,
		)
	}
	return player_index, nil
}
func checkPlayerActivity(game *game) {
	for _, player := range game.Players {
		if time.Since(player.LastTime) > time.Minute {
			sendEventToOtherPlayers(game, -1, &Message{
				Type: Disconnect,
				Id:   player.DisplayName,
			})
			game.Players, _ = shared.UnstableDelete(game.Players, player)
		}
	}
}
func addPlayer(game *game, message *Message) MessageResult {
	var display_name = message.Jsondata
	if slices.ContainsFunc(game.Players, func(p *player) bool {
		return p.DisplayName == display_name
	}) {
		return MessageResult{
			Err:        errors.New(DisplayNameTaken),
			Statuscode: http.StatusConflict,
		}
	}
	new_player := getNewEmptyPlayer()
	new_player.DisplayName = display_name
	source := rand.NewSource(time.Now().UnixNano())
	display_sum := sha256.Sum256([]byte(new_player.DisplayName + fmt.Sprintf("%d", source.Int63())))
	new_player.Userid = base64.StdEncoding.EncodeToString(display_sum[:])
	game.Players = append(game.Players, &new_player)
	return MessageResult{
		Message: &Message{
			Type:     RawText,
			Jsondata: new_player.Userid,
		},
		Statuscode: http.StatusOK,
	}
}
func joinResponse(game *game, message *Message) MessageResult {
	if game.HasStarted {
		return MessageResult{
			Err:        errors.New(GameAlreadyStarted),
			Statuscode: http.StatusConflict,
		}
	}
	response := addPlayer(game, message)
	defer log.Println("this function should've returned")
	if response.Err == nil {
		fmt.Println(response.Message)
		message.Id = response.Message.Jsondata
		sendEventToOtherPlayers(game, len(game.Players)-1, message)
	}
	return response
}
func sendBasicEvents(game *game, message *Message) MessageResult {
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusBadRequest}
	}
	sendEventToOtherPlayers(game, player_index, message)
	return MessageResult{
		Message:    &Message{Type: NoContent},
		Statuscode: http.StatusNoContent}
}
func getStartStateResponse(game *game, message *Message) MessageResult {
	current_players := make([]ClientStartPlayer, 0)
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		log.Println("state ?")
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusBadRequest}
	}
	for i, player := range game.Players {
		if i != player_index {
			current_players = append(current_players, ClientStartPlayer{
				Name: player.DisplayName, IsReady: player.IsReady})
		}
	}
	current_players_json, err := json.Marshal(current_players)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusInternalServerError}
	}
	return MessageResult{Message: &Message{
		Type:     PlayerList,
		Jsondata: string(current_players_json),
	},
		Statuscode: http.StatusOK}
}
func getEventsResponse(game *game, message *Message) MessageResult {
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusBadRequest}
	}
	player := game.Players[player_index]
	messages_json, err := json.Marshal(player.Messages)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusInternalServerError}
	}
	player.Messages = make([]*Message, 0)
	return MessageResult{Message: &Message{
		Type:     NestedMessages,
		Jsondata: string(messages_json),
	},
		Statuscode: http.StatusOK,
	}
}
func readyUnreadyResponse(game *game, message *Message) MessageResult {
	if game.HasStarted {
		return MessageResult{
			Err:        errors.New(GameAlreadyStarted),
			Statuscode: http.StatusConflict,
		}
	}
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusBadRequest}
	}
	sendEventToOtherPlayers(game, player_index, message)
	return MessageResult{Message: &Message{Type: NoContent},
		Statuscode: http.StatusNoContent}
}
func checkIfAllReadyWithPlayerExists(game *game, message *Message) {
	player_index, _ := getPlayerIndex(game, message)
	game.Players[player_index].IsReady = true
	if !slices.ContainsFunc(game.Players, func(p *player) bool {
		return p.IsReady == false
	}) && len(game.Players) >= 2 {
		game.HasStarted = true
		sendEventToOtherPlayers(game, -1, &Message{
			Type: GameStart,
		})
	}
}
func addGuessWithPlayerExists(game *game, message *Message) error {
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		return err
	}
	player := game.Players[player_index]
	var guess Guess
	err = json.Unmarshal([]byte(message.Jsondata), &guess)
	if err != nil {
		return err
	}
	if guess.Status == CorrectGuess {
		player.Guesses = make([]Guess, 0)
	}
	if guess.Status == OutofGuesses {
		player.Lives -= 1
		player.Guesses = make([]Guess, 0)
	}
	player.Guesses = append(player.Guesses, guess)
	return nil
}
func getCurrentGameStateResponse(game *game, _ *Message) MessageResult {
	player_struct := make([]ClientPlayer, 0)
	for _, player := range game.Players {
		player_struct = append(player_struct, ClientPlayer{
			Name: player.DisplayName, IsReady: player.IsReady,
			Guesses: player.Guesses, Lives: player.Lives})
	}
	player_json, err := json.Marshal(player_struct)
	if err != nil {
		return MessageResult{Err: err,
			Statuscode: http.StatusInternalServerError}
	}
	return MessageResult{Message: &Message{
		Type:     FullGameState,
		Jsondata: string(player_json),
	},
		Statuscode: http.StatusOK,
	}
}
func voteToKickResponse(game *game, message *Message) MessageResult {
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		return MessageResult{Err: err,
			Statuscode: http.StatusBadRequest}
	}
	sending_player := game.Players[player_index]
	target_player_name := message.Jsondata
	target_index := slices.IndexFunc(game.Players, func(p *player) bool {
		return p.DisplayName == target_player_name
	})
	if target_index == -1 {
		return MessageResult{
			Err: fmt.Errorf(
				"target player: %s not found in %v",
				target_player_name,
				game.Players,
			),
			Statuscode: http.StatusBadRequest,
		}
	}
	target_player := game.Players[target_index]
	if !slices.ContainsFunc(target_player.VotedAgainst, func(id string) bool {
		return id == sending_player.Userid
	}) {
		target_player.VotedAgainst = append(target_player.VotedAgainst, sending_player.Userid)
		if len(game.Players)-len(target_player.VotedAgainst) <= ((len(game.Players)-1)/4)+1 {
			sendEventToOtherPlayers(game, -1, &Message{
				Type: Kick, Id: "", Jsondata: target_player.DisplayName},
			)
		}
	}
	return MessageResult{
		Message:    &Message{Type: NoContent},
		Err:        nil,
		Statuscode: http.StatusNoContent,
	}
}
func sendChatResponse(game *game, message *Message) MessageResult {
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusBadRequest,
		}
	}
	sendEventToOtherPlayers(game, player_index, message)
	return MessageResult{
		Message:    &Message{Type: NoContent},
		Statuscode: http.StatusNoContent,
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
		//process_start := time.Now()
		switch message.Type {
		case NewGuess, NewEffect, PlayerDied:
			game.Responses <- sendBasicEvents(game, message)
		case Join:
			game.Responses <- joinResponse(game, message)
		case Disconnect:
			response := sendBasicEvents(game, message)
			if response.Err == nil {
				player_index, _ := getPlayerIndex(game, message)
				game.Players = shared.UnstableDeleteIndex(game.Players, player_index)
			}
			game.Responses <- response
		case Ready:
			response := readyUnreadyResponse(game, message)
			if response.Err == nil {
				checkIfAllReadyWithPlayerExists(game, message)
			}
			game.Responses <- response
		case Unready:
			response := readyUnreadyResponse(game, message)
			if response.Err == nil {
				player_index, _ := getPlayerIndex(game, message)
				game.Players[player_index].IsReady = false
			}
			game.Responses <- response
		case GetStartState:
			game.Responses <- getStartStateResponse(game, message)
		case GetEvents:
			game.Responses <- getEventsResponse(game, message)
		case GetFullState:
			game.Responses <- getCurrentGameStateResponse(game, message)
		case VoteKick:
			game.Responses <- voteToKickResponse(game, message)
		case SendChat:
			game.Responses <- sendChatResponse(game, message)
		default:
			game.Responses <- MessageResult{
				Message:    nil,
				Err:        fmt.Errorf("message type num %d unsupported", message.Type),
				Statuscode: http.StatusBadRequest,
			}
		}
		if time.Since(time_check) > time.Second*30 {
			time_check = time.Now()
			checkPlayerActivity(game)
		}
		//log.Println("main game loop process took: ", time.Since(process_start).Milliseconds(), "ms")
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
