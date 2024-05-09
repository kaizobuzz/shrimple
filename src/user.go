package src

import (
	"encoding/json"
	"errors"
	"os"
	"shrimple/src/shared"
	"sync"
)

type User = shared.User

var UserMap shared.Locked[map[int64]*User]

func GetUserById(id int64) *User {
    usermap := UserMap.SafeAccessInner()
    defer UserMap.Lock.Unlock()
    return usermap[id]
}

func GetUserByName(username string) *User {
	// exists to abstract over what variable is used to index into UserMap
	// for a planned change to indexing by id

    var u *User = nil;
    usermap := UserMap.SafeAccessInner();
    for _, user := range usermap {
        if user.Username == username {
            u = user;
            break;
        }
    }
    UserMap.Lock.Unlock()
    return u
}

var currentID int64
var currentIDMutex sync.Mutex
func CreateUser(username, password string) error {
	if UsernameTaken(username) {
		return errors.New("Account already exists with that name")
	}
	hash := hashPassword(username, password)
    
    usermap := UserMap.SafeAccessInner()
    
    var guesshistorymap map[string]map[int64]int = make(map[string]map[int64]int)
    for _, gamemode := range SHRIMPLE_GAMEMODES {
        guesshistorymap[gamemode] = make(map[int64]int)
    }

    var new_user *User = &User{
		Username: username,
		Id: int64(
			len(usermap),
		), //should be a mutex to avoid duplicate ids but oh well
		PasswordHash:           hash,
		Experience:             0,
		Friends:                []int64{},
		IncomingFriendRequests: []int64{},
		OutgoingFriendRequests: []int64{},
        GuessHistory: guesshistorymap,
    }

	usermap[new_user.Id] = new_user
    UserMap.Lock.Unlock()

	err := WriteUsersToFile()
	if err != nil {
        UserMap.SafeProcessInner(func(x map[int64]*User){
            delete(x, new_user.Id)
        });
		return err
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

var UserFileLock sync.Mutex

func WriteUsersToFile() error {
    UserFileLock.Lock()
    defer UserFileLock.Unlock()
	var userlist []User
	for _, value := range UserMap.SafeAccessInner() {
		userlist = append(userlist, *value)
	}
    UserMap.Lock.Unlock();
    
	bytes, err := json.Marshal(userlist)
	if err != nil {
		return err
	}

	file, err := os.Create("data/temp_users.json")
	if err != nil {
		return err
	}

	_, err = file.Write(bytes)
	if err != nil {
		return err
	}

	//Wrote file successfully.  Remove old users.json and copy temp_users.json into users.json
	//os.Remove("data/users.json") // apparently unneccesary
	os.Rename("data/temp_users.json", "data/users.json")

	return nil
}

func ReadUsersFromFile() error {
    UserMap = shared.Locked[map[int64]*User]{Value: make(map[int64]*User)}
	var jsonuserlist []jsonUser

	file, err := os.ReadFile("data/users.json")
	if err != nil {
		return err
	}
    err = json.Unmarshal(file, &jsonuserlist)
    if err != nil {
        return err
    }
    adduserstomap := func (usermap map[int64]*User) error{
        for _, u := range jsonuserlist {
            user, err := deserializeUser(u)
            if err != nil {
                return err
            }
            usermap[user.Id] = user
        }
        return nil
    }

    adding_err:=shared.SafeProcessLockedWithReturn(&UserMap, adduserstomap)
    if adding_err != nil {
        return adding_err
    }

	return nil
}

func UsernameTaken(username string) bool {
	if GetUserByName(username) != nil {
		return true
	}
	return false
}
