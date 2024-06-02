package shared

type User struct {
	Username               string
	Id                     string
	PasswordHash           HashSalt
	Experience             int64
	Friends                []string //list of user ids
	IncomingFriendRequests []string // list of user ids
	OutgoingFriendRequests []string // list of user ids
    GuessHistory           map[string]map[int64]int; // string is gamemode
}

type HashSalt struct{
    Salt []byte
    Hash []byte
}

