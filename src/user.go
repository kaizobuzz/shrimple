package src

import (
	"errors"
	"shrimple/src/database"
	"shrimple/src/shared"
	"github.com/nrednav/cuid2"
    "net/http"
    "net/url"
)

type User = shared.User
type GuessHistory = shared.GuessHistory

func getUserIdRefererVal(r *http.Request)(string, error){
    u := &url.URL{}
    err := u.UnmarshalBinary([]byte(r.Referer()))
    if err != nil {
        return "", err
    }
    user_id := u.Query().Get("userid")
    return user_id, nil

}

func GetUserById(id string) (*User, error) {
	return database.SelectFullUserFromId(id)
}

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

    guesshistorymap:= make(map[string]GuessHistory)
	for _, gamemode := range SHRIMPLE_GAMEMODES {
		guesshistorymap[gamemode] = GuessHistory{LastDate: shared.GetCurrentDate()-1, Guesses: make([]int, 6)}
    }
    id:=cuid2.Generate()
	var new_user *User = &User{
		Username:               username,
		Id:                     id,
		PasswordHash:           *hashsalt,
		Experience:             0,
		Friends:                []string{},
		IncomingFriendRequests: []string{},
		OutgoingFriendRequests: []string{},
		GuessHistory:           guesshistorymap,
	}
	if err := database.AddNewUser(new_user); err != nil {
		return err
	}
	return nil
}

func UsernameTaken(username string) (bool, error) {
	return database.CheckIfUsernameExists(username)
}
