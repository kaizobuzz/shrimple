package shared

type Privacy int8

const (
	Private Privacy = iota
	Unlisted
	Public
)

type Settings struct {
	Privacy                      PrivacySettings
	AllowReceivingFriendRequests bool
}
type PrivacySettings struct {
	ViewUserInfo Privacy
}

func GetDefaultSettings() Settings {
	return Settings{
		Privacy: PrivacySettings{
			ViewUserInfo: Private,
		},
	}
}

type GuessHistory struct {
	Guesses        []int
	FailedShrimple int
	LastDate       int64
}

type User struct {
	Username               string
	Id                     string
	PasswordHash           HashSalt
	Experience             int64
	Friends                []string //list of user ids
	IncomingFriendRequests []string // list of user ids
	OutgoingFriendRequests []string // list of user ids
	GuessHistory           map[string]GuessHistory
}

type HashSalt struct {
	Salt []byte
	Hash []byte
}
