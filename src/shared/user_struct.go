package shared

type GuessHistory struct{
    Guesses []int
    FailedShrimple int
    LastDate int64
}

type User struct {
	Username               string
	Id                     string
	PasswordHash           HashSalt
	Experience             int64
	Friends                []string //list of user ids
	IncomingFriendRequests []string // list of user ids
	OutgoingFriendRequests []string // list of user ids
    GuessHistory           map[string]GuessHistory;
}

type HashSalt struct{
    Salt []byte
    Hash []byte
}

