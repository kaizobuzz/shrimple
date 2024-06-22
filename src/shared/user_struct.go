package shared

type Privacy uint8

const (
	Private Privacy = iota
	FriendsOnly
	Unlisted
	Public
)

type Searching uint8

const (
	None Searching = iota
	IdOnly
	Name
)

type Settings struct {
	Privacy PrivacySettings
}
type PrivacySettings struct {
	AllowReceivingFriendRequests Searching
	AllowBeingSearched           bool
	ShowOnLeaderboard            bool
	Page                         PagePrivacySettings
}
type PagePrivacySettings struct {
	ViewUserInfo     Privacy
	ViewGuessHistory bool
	ViewExperience   bool
}

func GetDefaultSettings() Settings {
	return Settings{
		Privacy: PrivacySettings{
			AllowReceivingFriendRequests: IdOnly,
			AllowBeingSearched:           false,
			ShowOnLeaderboard:            false,
			Page: PagePrivacySettings{
				ViewUserInfo:     Private,
				ViewGuessHistory: true,
				ViewExperience:   true,
			},
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
	Settings               Settings
}

type HashSalt struct {
	Salt []byte
	Hash []byte
}
