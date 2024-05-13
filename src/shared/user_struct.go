package shared

type User struct {
	Username               string
	Id                     int64
	PasswordHash           HashSalt
	Experience             int64
	Friends                []int64 //list of user ids
	IncomingFriendRequests []int64 // list of user ids
	OutgoingFriendRequests []int64 // list of user ids
    GuessHistory           map[string]map[int64]int; // string is gamemode
}

type HashSalt struct{
    Salt []byte
    Hash []byte
}

