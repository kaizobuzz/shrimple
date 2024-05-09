package database

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

var Database *sql.DB

const sql_string_CREATE_USER_TABLE = "CREATE TABLE if NOT EXISTS " + UserTableName + " ( " +
	UserFieldId + " INTEGER PRIMARY KEY, " +
	UserFieldUsername + " TEXT UNIQUE, " +
	UserFieldPasswordHash + " TEXT NOT NULL, " +
	UserFieldExperience + " INTEGER NOT NULL, " +
	UserFieldGuessHistory + " BLOB NOT NULL)"

const sql_string_CREATE_USERNAME_INDEX = `CREATE UNIQUE INDEX if NOT EXISTS index_username ON ` + UserTableName + "(" + UserFieldUsername + ")"

const sql_string_CREATE_FRIEND_TABLE = "CREATE TABLE if NOT EXISTS " + FriendTableName + " ( " +
	FriendFieldId1 + " INTEGER, " +
	FriendFieldId2 + " INTEGER, " +
	"FOREIGN KEY (" + FriendFieldId1 + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")," +
	"FOREIGN KEY (" + FriendFieldId1 + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")," +
	"constraint PK_FRIEND_TABLE PRIMARY KEY (" + FriendFieldId1 + "," + FriendFieldId2 + "))"

const sql_string_CREATE_FRIEND_INDEX_1 = "CREATE INDEX if NOT EXISTS index_id_1 ON " + FriendTableName + "(" + FriendFieldId1 + ")"

const sql_string_CREATE_FRIEND_INDEX_2 = "CREATE INDEX if NOT EXISTS index_id_1 ON " + FriendTableName + "(" + FriendFieldId2 + ")"

const sql_string_CREATE_FRIEND_REQUESTS_TABLE = "CREATE TABLE if NOT EXISTS " + FriendRequestTableName + " ( " + FriendRequestFieldSendingId + " INTEGER, " +
	FriendRequestFieldReceivingId + " INTEGER, " +
	"FOREIGN KEY (" + FriendRequestFieldSendingId + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")" +
	"FOREIGN KEY (" + FriendRequestFieldReceivingId + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")," +
	"constraint PK_FRIEND_REQUEST_TABLE PRIMARY KEY (" + FriendRequestFieldSendingId + "," + FriendRequestFieldReceivingId + "))"

const sql_string_CREATE_SENDING_ID_INDEX = "CREATE INDEX if NOT EXISTS index_sending_id ON " + FriendRequestTableName + "(" + FriendRequestFieldSendingId + ")"

const sql_string_CREATE_RECEIVING_ID_INDEX = "CREATE INDEX if NOT EXISTS index_receiving_id ON " + FriendRequestTableName + "(" + FriendRequestFieldReceivingId + ")"

func InitializeDB(filepath string) error {
	var err error
	Database, err = sql.Open("sqlite3", "./"+filepath)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_USER_TABLE)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_USERNAME_INDEX)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_FRIEND_TABLE)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_FRIEND_INDEX_1)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_FRIEND_INDEX_2)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_FRIEND_REQUESTS_TABLE)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_SENDING_ID_INDEX)
	if err != nil {
		return err
	}
	_, err = Database.Exec(sql_string_CREATE_RECEIVING_ID_INDEX)
	if err != nil {
		return err
	}

	return nil
}

const sql_string_GET_COUNT = "SELECT COUNT(" + UserFieldId + ") FROM " + UserTableName

// hai btw this is unscalable as fuck
func GetCount() (int64, error) {
	rows, err := Database.Query(sql_string_GET_COUNT)
	if err != nil {
		return -1, err
	}
	defer rows.Close()
	var count int64
	for rows.Next() {
		if err := rows.Scan(&count); err != nil {
			return -1, err
		}
	}
    return count, nil
}
