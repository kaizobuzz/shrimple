package multiplayer

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
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
	MessageTypeNewGuess int = iota
	MessageTypeNewEffect
	MessageTypePlayerList
	MessageTypePlayerDied
	MessageTypeJoin
	MessageTypeDisconnect
	MessageTypeReady
	MessageTypeUnready
	MessageTypeGameStart
	MessageTypeGetEvents
	MessageTypeGetStartState
	MessageTypeNoContent
	MessageTypeRawText
	MessageTypeNestedMessages
	MessageTypeGetFullState
	MessageTypeFullGameState
	MessageTypeVoteKick
	MessageTypeKick
	MessageTypeSendChat
)
const (
	ErrorStringDisplayNameTaken   string = "Display name taken"
	ErrorStringGameAlreadyStarted string = "Game already started"
	ErrorStringGameNotStarted     string = "Game not started"
)
var ErrDisplayNameTaken=errors.New(ErrorStringDisplayNameTaken)
var ErrGameNotStarted=errors.New(ErrorStringGameNotStarted)
var ErrGameAlreadyStarted=errors.New(ErrorStringGameAlreadyStarted)

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
		if time.Since(player.LastTime) > time.Second*30 {
			sendEventToOtherPlayers(game, -1, &Message{
				Type: MessageTypeDisconnect,
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
			Err:        ErrDisplayNameTaken,
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
			Type:     MessageTypeRawText,
			Jsondata: new_player.Userid,
		},
		Statuscode: http.StatusOK,
	}
}
func joinResponse(game *game, message *Message) MessageResult {
	if game.HasStarted {
		return MessageResult{
			Err:        ErrGameAlreadyStarted,
			Statuscode: http.StatusConflict,
		}
	}
	response := addPlayer(game, message)
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
		Message:    &Message{Type: MessageTypeNoContent},
		Statuscode: http.StatusNoContent}
}
func getStartStateResponse(game *game, message *Message) MessageResult {
	current_players := make([]ClientStartPlayer, 0)
	player_index, err := getPlayerIndex(game, message)
	if err != nil {
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
		Type:     MessageTypePlayerList,
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
    player.LastTime=time.Now()
	messages_json, err := json.Marshal(player.Messages)
	if err != nil {
		return MessageResult{
			Err:        err,
			Statuscode: http.StatusInternalServerError}
	}
	player.Messages = make([]*Message, 0)
	return MessageResult{Message: &Message{
		Type:     MessageTypeNestedMessages,
		Jsondata: string(messages_json),
	},
		Statuscode: http.StatusOK,
	}
}
func readyUnreadyResponse(game *game, message *Message) MessageResult {
	if game.HasStarted {
		return MessageResult{
			Err:        ErrGameAlreadyStarted,
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
	return MessageResult{Message: &Message{Type: MessageTypeNoContent},
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
			Type: MessageTypeGameStart,
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
    player.Guesses = append(player.Guesses, guess)
	if guess.Status == GuessStatusCorrectGuess {
		player.Guesses = make([]Guess, 0)
	}
	if guess.Status == GuessStatusOutofGuesses {
		player.Lives -= 1
		player.Guesses = make([]Guess, 0)
	}
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
		Type:     MessageTypeFullGameState,
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
				Type: MessageTypeKick, Id: "", Jsondata: target_player.DisplayName},
			)
		}
	}
	return MessageResult{
		Message:    &Message{Type: MessageTypeNoContent},
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
		Message:    &Message{Type: MessageTypeNoContent},
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
        case MessageTypeNewGuess:
            response:=sendBasicEvents(game, message)
            if response.Err==nil{
                err:=addGuessWithPlayerExists(game, message) 
                if err!=nil{
                    response.Err=err
                    response.Statuscode=http.StatusBadRequest
                }
            }
            game.Responses <-response
        case MessageTypeNewEffect, MessageTypePlayerDied:
			game.Responses <- sendBasicEvents(game, message)
		case MessageTypeJoin:
			game.Responses <- joinResponse(game, message)
		case MessageTypeDisconnect:
			response := sendBasicEvents(game, message)
			if response.Err == nil {
				player_index, _ := getPlayerIndex(game, message)
				game.Players = shared.UnstableDeleteIndex(game.Players, player_index)
			}
			game.Responses <- response
		case MessageTypeReady:
			response := readyUnreadyResponse(game, message)
			if response.Err == nil {
				checkIfAllReadyWithPlayerExists(game, message)
			}
			game.Responses <- response
		case MessageTypeUnready:
			response := readyUnreadyResponse(game, message)
			if response.Err == nil {
				player_index, _ := getPlayerIndex(game, message)
				game.Players[player_index].IsReady = false
			}
			game.Responses <- response
		case MessageTypeGetStartState:
			game.Responses <- getStartStateResponse(game, message)
		case MessageTypeGetEvents:
			game.Responses <- getEventsResponse(game, message)
		case MessageTypeGetFullState:
			game.Responses <- getCurrentGameStateResponse(game, message)
		case MessageTypeVoteKick:
			game.Responses <- voteToKickResponse(game, message)
		case MessageTypeSendChat:
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
