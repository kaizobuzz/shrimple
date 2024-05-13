package src

import (
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
	hashsalt, err:= GeneratePassword(password)
    if err!=nil{
        return err
    }

	var guesshistorymap map[string]map[int64]int = make(map[string]map[int64]int)
	for _, gamemode := range SHRIMPLE_GAMEMODES {
		guesshistorymap[gamemode] = make(map[int64]int)
	}
	currentIDMutex.Lock()
	var new_user *User = &User{
		Username:               username,
		Id:                     currentID,
		PasswordHash:           *hashsalt,
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

func UsernameTaken(username string) (bool, error) {
	return database.CheckIfUsernameExists(username)
}
