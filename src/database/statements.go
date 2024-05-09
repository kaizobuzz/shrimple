package database

import (
	"database/sql"
	"shrimple/src/shared"
	"strings"
)

type User = shared.User

type SqlUser struct {
	Id                     int64
	Username               string
	PasswordHash           string
	Experience             int64
	GuessHistory           []byte //blob
}

var sqlQuerySelectFullUserFromId *sql.Stmt /*Order of Scanning arguments goes {Id, Username, PasswordHash, Experience, GuessHistory} */
const sql_string_SELECT_FULL_USER_FROM_ID = "SELECT * FROM " + UserTableName + " WHERE " + UserFieldId + " = ?"

var sqlQuerySelectFullUserFromUsername *sql.Stmt /*Order of Scanning arguments goes {Id, Username, PasswordHash, Experience, GuessHistory} */
const sql_string_SELECT_FULL_USER_FROM_USERNAME = "SELECT * FROM " + UserTableName + " WHERE " + UserFieldUsername + " = ?"

var sqlQuerySelectAuthenticationFieldsFromId *sql.Stmt /*returns {Id, Username, PasswordHash} */
const sql_string_SELECT_AUTHENTIFICATION_FIELDS_FROM_ID = "SELECT " +
	UserFieldId + ", " +
	UserFieldUsername + ", " +
	UserFieldPasswordHash +
	" FROM " + UserTableName + " WHERE " + UserFieldId + " = ?"

var sqlQuerySelectAuthenticationFieldsFromUsername *sql.Stmt /*returns {Id, Username, PasswordHash} */
const sql_string_SELECT_AUTHENTIFICATION_FIELDS_FROM_USERNAME = "SELECT " +
	UserFieldId + ", " +
	UserFieldUsername + ", " +
	UserFieldPasswordHash +
	" FROM " + UserTableName + " WHERE " + UserFieldUsername + " = ?"

var sqlQueryAddUserStatement *sql.Stmt /*Order of Arguments goes {Id, Username, PasswordHash, Experience, GuessHistory} */
const sql_string_ADD_USER_STATEMENT = "INSERT INTO " + UserTableName +
	" VALUES (?, ?, ?, ?, ?)"

var sqlQuerySelectGuessHistoryFromId *sql.Stmt

const sql_string_SELECT_GUESS_HISTORY_FROM_ID = "SELECT " +
	UserFieldGuessHistory + " FROM " + UserTableName + " WHERE " + UserFieldId + " = ?"


var sqlQueryUpdateGuessHistoryWithId *sql.Stmt /*Args order {GuessHistory, Id} */
const sql_string_UPDATE_GUESS_HISTORY_WITH_ID = "UPDATE " + UserTableName + " SET " + UserFieldGuessHistory + " = ? WHERE " + UserFieldId + " = ?"

var sqlQuerySelectFriendsFromId *sql.Stmt
const sql_string_SELECT_FRIENDS_FROM_ID="SELECT "+FriendFieldId2+" FROM "+FriendTableName+" WHERE "+FriendFieldId1+" = ?"

var sqlQuerySelectOutgoingFriendRequestsFromId *sql.Stmt
const sql_string_SELECT_OUTGOING_FRIEND_REQUESTS_FROM_ID="SELECT "+FriendRequestFieldReceivingId+" FROM "+FriendRequestTableName+" WHERE "+FriendRequestFieldSendingId+" = ?"

var sqlQuerySelectIncomingFriendRequestsFromId *sql.Stmt
const sql_string_SELECT_INCOMING_FRIEND_REQUESTS_FROM_ID="SELECT "+FriendRequestFieldSendingId+" FROM "+FriendRequestTableName+" WHERE "+FriendRequestFieldReceivingId+" = ?"


var sqlQueryAddOutgoingFriendRequest *sql.Stmt /*Args order, {sending_id, receiving_id}*/
const sql_string_ADD_FRIEND_REQUEST = "INSERT INTO " + FriendRequestTableName + " VALUES (?, ?)"

var sqlQueryRemoveOutgoingFriendRequest *sql.Stmt /*Args order {sending_id, receiving_id} */
const sql_string_REMOVE_FRIEND_REQUEST = "DELETE FROM " + FriendRequestTableName + " WHERE " + FriendRequestFieldSendingId + " = ? AND " + FriendRequestFieldReceivingId + " = ?"

var sqlQueryAddFriend *sql.Stmt                                                   /*Use helper function for this (DO NOT CALL DIRECTLY) to make the thing a one way relation */
const sql_string_ADD_FRIENDS = "INSERT INTO " + FriendTableName + " VALUES(?, ?)" /* */
var sqlQueryRemoveFriend *sql.Stmt                                                /*Use helper function for this (DO NOT CALL DIRECTLY) to make the thing a one way relation */
const sql_string_REMOVE_FRIEND = "DELETE FROM " + FriendTableName + " WHERE " + FriendFieldId1 + " = ? AND " + FriendFieldId2 + " = ?"

const start_sql_string_SELECT_USERNAMES_FROM_ID_START = "SELECT " + UserFieldId + ", " + UserFieldUsername + " FROM " + UserTableName + " WHERE " + UserFieldId + " IN (?"

func PrepareStatements(database *sql.DB) error {
	var err error
	sqlQuerySelectFullUserFromId, err = database.Prepare(
		sql_string_SELECT_FULL_USER_FROM_ID,
	)
	if err != nil {
		return err
	}
	sqlQuerySelectFullUserFromUsername, err = database.Prepare(
		sql_string_SELECT_FULL_USER_FROM_USERNAME,
	)
	if err != nil {
		return err
	}
	sqlQuerySelectAuthenticationFieldsFromId, err = database.Prepare(
		sql_string_SELECT_AUTHENTIFICATION_FIELDS_FROM_ID,
	)
	if err != nil {
		return err
	}
	sqlQuerySelectAuthenticationFieldsFromUsername, err = database.Prepare(
		sql_string_SELECT_AUTHENTIFICATION_FIELDS_FROM_USERNAME,
	)
	if err != nil {
		return err
	}
	sqlQueryAddUserStatement, err = database.Prepare(sql_string_ADD_USER_STATEMENT)
	if err != nil {
		return err
	}
	sqlQuerySelectGuessHistoryFromId, err = database.Prepare(
		sql_string_SELECT_GUESS_HISTORY_FROM_ID,
	)
	if err != nil {
		return err
	}
    sqlQuerySelectFriendsFromId, err = database.Prepare(
        sql_string_SELECT_FRIENDS_FROM_ID,
    )
    if err!=nil{
        return err
    }
    sqlQuerySelectIncomingFriendRequestsFromId, err = database.Prepare(
        sql_string_SELECT_INCOMING_FRIEND_REQUESTS_FROM_ID,
    )
    if err!=nil{
        return err
    }
    sqlQuerySelectOutgoingFriendRequestsFromId, err = database.Prepare(
        sql_string_SELECT_OUTGOING_FRIEND_REQUESTS_FROM_ID,
    )
    if err!=nil{
        return err
    }
	sqlQueryAddOutgoingFriendRequest, err = database.Prepare(
		sql_string_ADD_FRIEND_REQUEST,
	)
	if err != nil {
		return err
	}
	sqlQueryRemoveOutgoingFriendRequest, err = database.Prepare(
		sql_string_REMOVE_FRIEND_REQUEST,
	)
	if err != nil {
		return err
	}
	sqlQueryAddFriend, err = database.Prepare(
		sql_string_ADD_FRIENDS,
	)
	if err != nil {
		return err
	}
	sqlQueryRemoveFriend, err = database.Prepare(
		sql_string_REMOVE_FRIEND,
	)
	if err != nil {
		return err
	}
	return nil
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
    user.Friends=make([]int64, 0)
    friend_rows, err:=sqlQuerySelectFriendsFromId.Query(user.Id)
    defer friend_rows.Close()
    if err!=nil{
        return nil, err
    }
    for friend_rows.Next(){
        var id int64
        friend_rows.Scan(&id)
        user.Friends = append(user.Friends, id)
    }
    user.IncomingFriendRequests=make([]int64, 0)
    incoming_friend_request_rows, err:=sqlQuerySelectIncomingFriendRequestsFromId.Query(user.Id)
    defer incoming_friend_request_rows.Close()
    if err!=nil{
        return nil, err
    }
    for incoming_friend_request_rows.Next(){
        var id int64
        incoming_friend_request_rows.Scan(&id)
        user.IncomingFriendRequests=append(user.IncomingFriendRequests, id)
    }
    user.OutgoingFriendRequests=make([]int64, 0)
    outgoing_friend_request_rows, err:=sqlQuerySelectOutgoingFriendRequestsFromId.Query(user.Id)
    defer outgoing_friend_request_rows.Close()
    if err!=nil{
        return nil, err
    }
    for outgoing_friend_request_rows.Next(){
        var id int64 
        outgoing_friend_request_rows.Scan(&id)
        user.OutgoingFriendRequests = append(user.OutgoingFriendRequests, id)
    }
	
	if err := DecodeGob(sql_user.GuessHistory, &user.GuessHistory); err != nil {
		return nil, err
	}
	return &user, nil
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
    for _, friend_id:=range user.Friends{
        err=useAddFriendQuery(user.Id, friend_id)
        if err!=nil{
            return err
        }
    }
	if err != nil {
		return err
	}
	return nil
}

func SelectGuessHistoryFromId(id int64) (guess_history map[string]map[int64]int, err error) {
	row := sqlQuerySelectGuessHistoryFromId.QueryRow(id)
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
func UpdateGuessHistoryWithId(id int64, guess_history map[string]map[int64]int) error {
	guess_history_bytes, err := EncodeGob(guess_history)
	if err != nil {
		return err
	}
	_, err = sqlQueryUpdateGuessHistoryWithId.Exec(guess_history_bytes, id)
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
		_, err := sqlQueryAddOutgoingFriendRequest.Exec(sending_id, receiving_id)
		if err != nil {
			return err
		}
	case RejectedRequest:
		_, err := sqlQueryRemoveOutgoingFriendRequest.Exec(sending_id, receiving_id)
		if err != nil {
			return err
		}
	case AcceptedRequest:
		err := useAddFriendQuery(sending_id, receiving_id)
		if err != nil {
			return err
		}
		_, err = sqlQueryRemoveOutgoingFriendRequest.Exec(sending_id, receiving_id)
		if err != nil {
			return err
		}
	}
	return nil
}
func RemoveFriend(id_1 int64, id_2 int64) error{
    if err:=useDeleteFriendQuery(id_1, id_2); err!=nil{
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
