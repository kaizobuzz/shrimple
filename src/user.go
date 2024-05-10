package src

import (
	"encoding/json"
	"errors"
	"shrimple/src/database"
	"shrimple/src/shared"
	"sync"
)

type User = shared.User

func GetUserById(id int64) (*User, error) {
	return database.SelectFullUserFromId(id)
}

var currentID int64
var currentIDMutex sync.Mutex

func CreateUser(username, password string) error {
	taken, err := UsernameTaken(username)
	if err != nil {
		return err
	}
	if taken {
		return errors.New("Account already exists with that name")
	}
	hash := hashPassword(username, password)

	var guesshistorymap map[string]map[int64]int = make(map[string]map[int64]int)
	for _, gamemode := range SHRIMPLE_GAMEMODES {
		guesshistorymap[gamemode] = make(map[int64]int)
	}
	currentIDMutex.Lock()
	var new_user *User = &User{
		Username:               username,
		Id:                     currentID,
		PasswordHash:           hash,
		Experience:             0,
		Friends:                []int64{},
		IncomingFriendRequests: []int64{},
		OutgoingFriendRequests: []int64{},
		GuessHistory:           guesshistorymap,
	}
	currentID++
	currentIDMutex.Unlock()

	if err := database.AddNewUser(new_user); err != nil {
		return err
		//TODO currentID mutex might get messed up here?
	}
	return nil
}

func serializeUser(user User) (*[]byte, error) {
	json, err := json.Marshal(user)
	if err != nil {
		return nil, err
	}
	return &json, nil
}

type jsonUser struct {
	Username               string
	Id                     json.Number
	PasswordHash           string
	Experience             json.Number
	Friends                []json.Number
	IncomingFriendRequests []json.Number
	OutgoingFriendRequests []json.Number
}

func deserializeUser(user_json jsonUser) (*User, error) {
	id, err := user_json.Id.Int64()
	if err != nil {
		return nil, err
	}

	exp, err := user_json.Experience.Int64()
	if err != nil {
		return nil, err
	}

	var friends []int64 = []int64{}
	for _, f := range user_json.Friends {
		new_f, err := f.Int64()
		if err != nil {
			return nil, err
		}
		friends = append(friends, new_f)
	}

	var incoming_friend_requests []int64 = []int64{}
	for _, f := range user_json.IncomingFriendRequests {
		new_ifr, err := f.Int64()
		if err != nil {
			return nil, err
		}
		incoming_friend_requests = append(incoming_friend_requests, new_ifr)
	}

	var outgoing_friend_requests []int64 = []int64{}
	for _, f := range user_json.OutgoingFriendRequests {
		new_ofr, err := f.Int64()
		if err != nil {
			return nil, err
		}
		outgoing_friend_requests = append(outgoing_friend_requests, new_ofr)
	}

	return &User{
		Username:               user_json.Username,
		Id:                     id,
		PasswordHash:           user_json.PasswordHash,
		Experience:             exp,
		Friends:                friends,
		IncomingFriendRequests: incoming_friend_requests,
		OutgoingFriendRequests: outgoing_friend_requests,
	}, nil
	//TODO will change with using a database but this doesn't receive the guess history so cant just replicate the same thing directly, probably will decide to not always return a whole user so that'll probably be kept in mind anyways but just yknow
}

func UsernameTaken(username string) (bool, error) {
	return database.CheckIfUsernameExists(username)
}
