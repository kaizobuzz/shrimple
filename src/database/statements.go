package database

import (
	"database/sql"
	"fmt"
	"shrimple/src/shared"
	"strings"
)

type User = shared.User

type SqlUser struct {
	Id           int64
	Username     string
	PasswordHash string
	Experience   int64
	GuessHistory []byte //blob
}

func SelectFullUserFromUsername(username string) (*User, error) {
	row := sqlQuerySelectFullUserFromUsername.QueryRow(username)
	return SelectFullUserGivenRow(row)
}
func SelectFullUserFromId(id int64) (*User, error) {
	row := sqlQuerySelectFullUserFromId.QueryRow(id)
	return SelectFullUserGivenRow(row)
}
func SelectFullUserGivenRow(row *sql.Row) (*User, error) {
	sql_user := SqlUser{}
	err := row.Scan(
		&sql_user.Id,
		&sql_user.Username,
		&sql_user.PasswordHash,
		&sql_user.Experience,
		&sql_user.GuessHistory,
	)
	if err != nil {
		return nil, err
	}
	user := User{
		Username:     sql_user.Username,
		Id:           sql_user.Id,
		PasswordHash: sql_user.PasswordHash,
		Experience:   sql_user.Experience,
	}
	if user.Friends, err = SelectFriendsFromId(user.Id); err != nil {
		return nil, err
	}
	if user.IncomingFriendRequests, err = SelectIncomingFriendRequestsFromId(user.Id); err != nil {
		return nil, err
	}
	if user.OutgoingFriendRequests, err = SelectOutgoingFriendRequestsFromId(user.Id); err != nil {
		return nil, err
	}
	if err := DecodeGob(sql_user.GuessHistory, &user.GuessHistory); err != nil {
		return nil, err
	}
	return &user, nil
}

func SelectFriendsFromId(id int64) ([]int64, error) {
	friend_rows, err := sqlQuerySelectFriendsFromId.Query(id)
	if err != nil {
		return nil, err
	}
	defer friend_rows.Close()
	friendlist := make([]int64, 0)
	for friend_rows.Next() {
		var id int64
		if err := friend_rows.Scan(&id); err != nil {
			return nil, err
		}
		friendlist = append(friendlist, id)
	}
	return friendlist, nil
}
func SelectIncomingFriendRequestsFromId(id int64) ([]int64, error) {
	friend_rows, err := sqlQuerySelectIncomingFriendRequestsFromId.Query(id)
	if err != nil {
		return nil, err
	}
	defer friend_rows.Close()
	friend_request_list := make([]int64, 0)
	for friend_rows.Next() {
		var id int64
		if err := friend_rows.Scan(&id); err != nil {
			return nil, err
		}
		friend_request_list = append(friend_request_list, id)
	}
	return friend_request_list, nil
}
func SelectOutgoingFriendRequestsFromId(id int64) ([]int64, error) {
	friend_request_rows, err := sqlQuerySelectOutgoingFriendRequestsFromId.Query(id)
	if err != nil {
		return nil, err
	}
	defer friend_request_rows.Close()
	friend_request_list := make([]int64, 0)
	for friend_request_rows.Next() {
		var id int64
		if err := friend_request_rows.Scan(&id); err != nil {
			return nil, err
		}
		friend_request_list = append(friend_request_list, id)
	}
	return friend_request_list, nil
}

func SelectAuthenticationFieldsFromId(
	id int64,
) (username string, password_hash string, err error) {
	row := sqlQuerySelectAuthenticationFieldsFromId.QueryRow(id)
	_, username, password_hash, err = SelectAuthenticationFieldsGivenRow(row)
	return username, password_hash, err
}
func SelectAuthenticationFieldsFromUsername(
	username string,
) (id int64, password_hash string, err error) {
	row := sqlQuerySelectAuthenticationFieldsFromUsername.QueryRow(username)
	id, _, password_hash, err = SelectAuthenticationFieldsGivenRow(row)
	return id, password_hash, err
}
func SelectAuthenticationFieldsGivenRow(
	row *sql.Row,
) (id int64, username string, password_hash string, err error) {
	err = row.Scan(
		&id,
		&username,
		&password_hash,
	)
	if err != nil {
		return -1, "", "", err
	}
	return id, username, password_hash, nil
}

/*IMPORTANT Currently does not add friend requests */
func AddNewUser(user *User) error {
	sql_user := SqlUser{
		Id:           user.Id,
		Username:     user.Username,
		PasswordHash: user.PasswordHash,
		Experience:   user.Experience,
	}
	var err error
	if sql_user.GuessHistory, err = EncodeGob(&user.GuessHistory); err != nil {
		return err
	}
	_, err = sqlQueryAddUserStatement.Exec(
		sql_user.Id,
		sql_user.Username,
		sql_user.PasswordHash,
		sql_user.Experience,
		sql_user.GuessHistory,
	)
	//TODO currently making the assumption that any user sent is valid including the friends,
	for _, friend_id := range user.Friends {
		err = useAddFriendQuery(user.Id, friend_id)
		if err != nil {
			return err
		}
	}
	if err != nil {
		return err
	}
	return nil
}

func SelectGuessHistoryFromUsername(
	username string,
) (guess_history map[string]map[int64]int, err error) {
	row := sqlQuerySelectGuessHistoryFromUsername.QueryRow(username)
	return SelectGuessHistoryGivenRow(row)
}
func SelectGuessHistoryFromId(id int64) (guess_history map[string]map[int64]int, err error) {
	row := sqlQuerySelectGuessHistoryFromId.QueryRow(id)
	return SelectGuessHistoryGivenRow(row)
}
func SelectGuessHistoryGivenRow(row *sql.Row) (guess_history map[string]map[int64]int, err error) {
	guess_history_bytes := make([]byte, 0)
	err = row.Scan(
		&guess_history_bytes,
	)
	if err != nil {
		return nil, err
	}
	guess_history = make(map[string]map[int64]int)
	if err = DecodeGob(guess_history_bytes, &guess_history); err != nil {
		return nil, err
	}
	return guess_history, nil

}
func UpdateGuessHistoryWithUsername(username string, guess_history map[string]map[int64]int) error {
	guess_history_bytes, err := EncodeGob(guess_history)
	if err != nil {
		return err
	}
	_, err = sqlQueryUpdateGuessHistoryWithUsername.Exec(guess_history_bytes, username)
	if err != nil {
		return err
	}
	return nil
}

type FriendUpdate int8

const (
	SentRequest FriendUpdate = iota
	RejectedRequest
	AcceptedRequest
)

func useAddFriendQuery(id_1 int64, id_2 int64) error {
	_, err := sqlQueryAddFriend.Exec(id_1, id_2)
	if err != nil {
		return err
	}
	_, err = sqlQueryAddFriend.Exec(id_2, id_1)
	if err != nil {
		return err
	}
	return nil
}
func useDeleteFriendQuery(id_1 int64, id_2 int64) error {
	_, err := sqlQueryRemoveFriend.Exec(id_1, id_2)
	if err != nil {
		return err
	}
	_, err = sqlQueryRemoveFriend.Exec(id_2, id_1)
	if err != nil {
		return err
	}
	return nil
}

func UpdateFriendRequests(sending_id int64, receiving_id int64, status FriendUpdate) error {
	switch status {
	case SentRequest:
		exists, err := CheckIfRequestExists(receiving_id, sending_id)
		if err != nil {
			return err
		}
		if exists {
			return fmt.Errorf("Request between %d and %d already exists", receiving_id, sending_id)
		}
		_, err = sqlQueryAddOutgoingFriendRequest.Exec(sending_id, receiving_id)
		if err != nil {
			return err
		}
	case RejectedRequest:
		_, err := sqlQueryRemoveOutgoingFriendRequest.Exec(sending_id, receiving_id)
		if err != nil {
			return err
		}
	case AcceptedRequest:
		exists, err := CheckIfRequestExists(sending_id, receiving_id)
		if err != nil {
			return err
		}
		if !exists {
			return fmt.Errorf(
				"Friend request between ids %d and %d does not exist",
				sending_id,
				receiving_id,
			)
		}
		err = useAddFriendQuery(sending_id, receiving_id)
		if err != nil {
			return err
		}
		_, err = sqlQueryRemoveOutgoingFriendRequest.Exec(sending_id, receiving_id)
		if err != nil {
			return err
		}
	default:
		return fmt.Errorf("FriendUpdate num %d not valid", status)
	}
	return nil
}
func CheckIfRequestExists(sending_id int64, receiving_id int64) (bool, error) {
	row := sqlQueryCheckIfFriendRequestExists.QueryRow(sending_id, receiving_id)
	var count int
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	if count == 1 {
		return true, nil
	}
	return false, nil
}
func RemoveFriend(id_1 int64, id_2 int64) error {
	if err := useDeleteFriendQuery(id_1, id_2); err != nil {
		return err
	}
	return nil
}

type IdUsernamePair struct {
	Id       int64
	Username string
}

/*
TODO if a user is deleted this will keep returning errors without knowing why
I think this means if a user is ever deleted it's probably best to go through the friend lists of everyone and delete them or such but idk exactly
IMPORTANT: Does not return values in the same order as sent in, should not matter as most requests will be sent new i think but yeah
*/
func GetUsernameListFromIdList(ids []int64) ([]IdUsernamePair, error) {
	if len(ids) == 0 {
		return make([]IdUsernamePair, 0), nil
	}
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		args[i] = id
	}
	stmt := start_sql_string_SELECT_USERNAMES_FROM_ID_START + strings.Repeat(
		",?",
		len(args)-1,
	) + ")"
	rows, err := Database.Query(stmt, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	usernames := make([]IdUsernamePair, 0, len(args))
	for rows.Next() {
		var id int64
		var username string
		if err := rows.Scan(&id, &username); err != nil {
			return nil, err
		}
		usernames = append(usernames, IdUsernamePair{Id: id, Username: username})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return usernames, nil
}
func CheckIfUsernameExists(username string) (bool, error) {
	row := sqlQueryCheckIfUsernameExists.QueryRow(username)
	var count int
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	if count == 1 {
		return true, nil
	}
	return false, nil
}

const max_SUBSTR_LENGTH=30//TODO idk unmagic the number

func SearchForUsernames(substring string) ([]IdUsernamePair, error) {
    if len(substring)>max_SUBSTR_LENGTH{
        return nil, fmt.Errorf("substring %s is too long, length %d, (max %d)", substring, len(substring), max_SUBSTR_LENGTH)
    }
	usernames, err := searchForPattern("", "%", substring)
	if err != nil {
		return nil, err
	}
	if len(usernames) < UserSearchLimit {
		usernames, err = searchForPattern("%", "%", substring)
		if err != nil {
			return nil, err
		}
	}
	return usernames, nil
}
func searchForPattern(left, right, substring string) ([]IdUsernamePair, error) {
	rows, err := sqlQuerySearchForUsername.Query(escapeLike(left, right, substring))
	if err != nil {
		return nil, err
	}
	usernames := make([]IdUsernamePair, 0)
	for rows.Next() {
		var id int64
		var username string
		if err := rows.Scan(&username, &id); err != nil {
			return nil, err
		}
		usernames = append(usernames, IdUsernamePair{Username: username, Id: id})
	}
	return usernames, nil
}

// function from https://github.com/go-gorm/gorm/issues/5972
func escapeLike(left, right, word string) string {
	var n int
	for i := range word {
		if c := word[i]; c == '%' || c == '_' || c == '\\' {
			n++
		}
	}
	// No characters to escape.
	if n == 0 {
		return left + word + right
	}
	var b strings.Builder
	b.Grow(len(word) + n)
	for _, c := range word {
		if c == '%' || c == '_' || c == '\\' {
			b.WriteByte('\\')
		}
		b.WriteRune(c)
	}
	return left + b.String() + right
}
