package src
import (
    "encoding/json"
    "os"
)

var UserMap map[string]*User

type User struct {
    Username string
    Id int64
    PasswordHash string
    Experience int64
    Friends []int64 //list of user ids
    IncomingFriendRequests []int64 // list of user ids
    OutgoingFriendRequests []int64 // list of user ids
}

func serializeUser(user User) (*[]byte, error) {
    json, err := json.Marshal(user)
    if err != nil {
        return nil, err
    }
    return &json, nil
}

type jsonUser struct {
    Username string
    Id json.Number
    PasswordHash string
    Experience json.Number
    Friends []json.Number
    IncomingFriendRequests []json.Number
    OutgoingFriendRequests []json.Number
}
func deserializeUser(user_json jsonUser) (*User, error){

    id, err := user_json.Id.Int64()
    if err != nil {
        return nil, err
    }

    exp, err := user_json.Experience.Int64()
    if err != nil {
        return nil, err
    }

    var friends []int64 = []int64{}
    for _,f := range user_json.Friends{
        new_f, err := f.Int64()
        if err != nil {
            return nil, err
        }
        friends = append(friends, new_f)
    }

    var incoming_friend_requests []int64 = []int64{}
    for _,f := range user_json.IncomingFriendRequests {
        new_ifr, err := f.Int64()
        if err != nil {
            return nil, err
        }
        incoming_friend_requests = append(incoming_friend_requests, new_ifr)
    }

    var outgoing_friend_requests []int64 = []int64{}
    for _,f := range user_json.OutgoingFriendRequests {
        new_ofr, err := f.Int64()
        if err != nil {
            return nil, err
        }
        outgoing_friend_requests = append(outgoing_friend_requests, new_ofr)
    }

    return &User{
        Username: user_json.Username,
        Id: id,
        PasswordHash: user_json.PasswordHash,
        Experience: exp,
        Friends: friends,
        IncomingFriendRequests: incoming_friend_requests,
        OutgoingFriendRequests: outgoing_friend_requests,
    }, nil
}

func WriteUsersToFile() error {
    var userlist []User
    for _,value := range UserMap {
        userlist = append(userlist, *value)
    }
    bytes, err := json.Marshal(userlist)
    if err != nil {
        return err
    }

    file, err := os.Open("data/temp_users.json")
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
    var jsonuserlist []jsonUser

    file, err := os.ReadFile("data/users.json")
    if err != nil {
        return err
    }
    json.Unmarshal(file, &jsonuserlist)

    for _,u := range jsonuserlist{
        user, err := deserializeUser(u) 
        if err != nil {
            return err
        }
        UserMap[user.Username] = user
    }
    return nil
}
