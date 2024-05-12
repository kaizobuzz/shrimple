package database
import("database/sql")

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

var sqlQuerySelectGuessHistoryFromUsername *sql.Stmt
const sql_string_SELECT_GUESS_HISTORY_FROM_USERNAME = "SELECT " +
	UserFieldGuessHistory + " FROM " + UserTableName + " WHERE " + UserFieldUsername + " = ?"

var sqlQuerySelectGuessHistoryFromId *sql.Stmt
const sql_string_SELECT_GUESS_HISTORY_FROM_ID = "SELECT " +
	UserFieldGuessHistory + " FROM " + UserTableName + " WHERE " + UserFieldId + " = ?"

var sqlQueryUpdateGuessHistoryWithUsername *sql.Stmt /*Args order {GuessHistory, Id} */
const sql_string_UPDATE_GUESS_HISTORY_WITH_ID = "UPDATE " + UserTableName + " SET " + UserFieldGuessHistory + " = ? WHERE " + UserFieldUsername + " = ?"

var sqlQuerySelectFriendsFromId *sql.Stmt
const sql_string_SELECT_FRIENDS_FROM_ID = "SELECT " + FriendFieldId2 + " FROM " + FriendTableName + " WHERE " + FriendFieldId1 + " = ?"

var sqlQuerySelectOutgoingFriendRequestsFromId *sql.Stmt
const sql_string_SELECT_OUTGOING_FRIEND_REQUESTS_FROM_ID = "SELECT " + FriendRequestFieldReceivingId + " FROM " + FriendRequestTableName + " WHERE " + FriendRequestFieldSendingId + " = ?"

var sqlQuerySelectIncomingFriendRequestsFromId *sql.Stmt
const sql_string_SELECT_INCOMING_FRIEND_REQUESTS_FROM_ID = "SELECT " + FriendRequestFieldSendingId + " FROM " + FriendRequestTableName + " WHERE " + FriendRequestFieldReceivingId + " = ?"

var sqlQueryAddOutgoingFriendRequest *sql.Stmt /*Args order, {sending_id, receiving_id}*/
const sql_string_ADD_FRIEND_REQUEST = "INSERT INTO " + FriendRequestTableName + " VALUES (?, ?)"

var sqlQueryRemoveOutgoingFriendRequest *sql.Stmt /*Args order {sending_id, receiving_id} */
const sql_string_REMOVE_FRIEND_REQUEST = "DELETE FROM " + FriendRequestTableName + " WHERE " + FriendRequestFieldSendingId + " = ? AND " + FriendRequestFieldReceivingId + " = ?"

var sqlQueryAddFriend *sql.Stmt                                                   /*Use helper function for this (DO NOT CALL DIRECTLY) to make the thing a one way relation */
const sql_string_ADD_FRIENDS = "INSERT INTO " + FriendTableName + " VALUES(?, ?)" /* */
var sqlQueryRemoveFriend *sql.Stmt                                                /*Use helper function for this (DO NOT CALL DIRECTLY) to make the thing a one way relation */
const sql_string_REMOVE_FRIEND = "DELETE FROM " + FriendTableName + " WHERE " + FriendFieldId1 + " = ? AND " + FriendFieldId2 + " = ?"

const start_sql_string_SELECT_USERNAMES_FROM_ID_START = "SELECT " + UserFieldId + ", " + UserFieldUsername + " FROM " + UserTableName + " WHERE " + UserFieldId + " IN (?"

var sqlQueryCheckIfUsernameExists *sql.Stmt

const sql_string_CHECK_IF_USERNAME_EXISTS = "SELECT COUNT(1) FROM " + UserTableName + " WHERE " + UserFieldUsername + " = ?"

var sqlQueryCheckIfFriendRequestExists *sql.Stmt /*Args order, {sending_id, receiving_id}*/
const sql_string_CHECK_IF_FRIEND_REQUEST_EXISTS = "SELECT COUNT(1) FROM " + FriendRequestTableName + " WHERE " + FriendRequestFieldSendingId + " = ? AND " + FriendRequestFieldReceivingId + " = ?"


const UserSearchLimit=20
var sqlQuerySearchForUsername *sql.Stmt /*Scanning order {Username, id} , please use EscapeLike to prevent accidental wildcards where unwanted*/
const sql_string_SEARCH_FOR_USERNAME = "SELECT "+UserFieldUsername+", "+UserFieldId+" FROM "+UserTableName+" WHERE "+UserFieldUsername+" LIKE ? LIMIT 20"

type StatementPreparer struct {
	database *sql.DB
	err      error
}

func (s *StatementPreparer) PrepareStatement(global_stmt **sql.Stmt, sql_string string) {
	if s.err != nil {
		return
	}
	*global_stmt, s.err = s.database.Prepare(sql_string)
}

func PrepareStatements(database *sql.DB) error {
	statement_preparer := StatementPreparer{database: database}
	statement_preparer.PrepareStatement(
		&sqlQuerySelectFullUserFromId,
		sql_string_SELECT_FULL_USER_FROM_ID,
	) 
	statement_preparer.PrepareStatement(
		&sqlQuerySelectFullUserFromUsername,
		sql_string_SELECT_FULL_USER_FROM_USERNAME,
	)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectAuthenticationFieldsFromId,
		sql_string_SELECT_AUTHENTIFICATION_FIELDS_FROM_ID,
	)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectAuthenticationFieldsFromUsername,
		sql_string_SELECT_AUTHENTIFICATION_FIELDS_FROM_USERNAME,
	)
	statement_preparer.PrepareStatement(&sqlQueryAddUserStatement, sql_string_ADD_USER_STATEMENT)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectGuessHistoryFromId,
		sql_string_SELECT_GUESS_HISTORY_FROM_ID,
	)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectGuessHistoryFromUsername,
		sql_string_SELECT_GUESS_HISTORY_FROM_USERNAME,
	)
	statement_preparer.PrepareStatement(
		&sqlQueryUpdateGuessHistoryWithUsername,
		sql_string_UPDATE_GUESS_HISTORY_WITH_ID,
	)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectFriendsFromId,
		sql_string_SELECT_FRIENDS_FROM_ID,
	)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectIncomingFriendRequestsFromId,
		sql_string_SELECT_INCOMING_FRIEND_REQUESTS_FROM_ID,
	)
	statement_preparer.PrepareStatement(
		&sqlQuerySelectOutgoingFriendRequestsFromId,
		sql_string_SELECT_OUTGOING_FRIEND_REQUESTS_FROM_ID,
	)
	statement_preparer.PrepareStatement(
		&sqlQueryAddOutgoingFriendRequest,
		sql_string_ADD_FRIEND_REQUEST,
	)
	statement_preparer.PrepareStatement(
		&sqlQueryRemoveOutgoingFriendRequest,
		sql_string_REMOVE_FRIEND_REQUEST,
	)
	statement_preparer.PrepareStatement(&sqlQueryAddFriend, sql_string_ADD_FRIENDS)
	statement_preparer.PrepareStatement(&sqlQueryRemoveFriend, sql_string_REMOVE_FRIEND)
	statement_preparer.PrepareStatement(
		&sqlQueryCheckIfUsernameExists,
		sql_string_CHECK_IF_USERNAME_EXISTS,
	)
	statement_preparer.PrepareStatement(
		&sqlQueryCheckIfFriendRequestExists,
		sql_string_CHECK_IF_FRIEND_REQUEST_EXISTS,
	)
    statement_preparer.PrepareStatement(
        &sqlQuerySearchForUsername,
        sql_string_SEARCH_FOR_USERNAME,
    )
	if statement_preparer.err != nil {
		return statement_preparer.err
	}
	return nil
}
