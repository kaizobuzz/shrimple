package database

import (
	"database/sql"
	"errors"
	_ "github.com/mattn/go-sqlite3"
	"os"
)

var Database *sql.DB

var UniqueConstraintConnection *sql.Conn

const sql_string_CREATE_USER_TABLE = "CREATE TABLE if NOT EXISTS " + UserTableName + " ( " +
	UserFieldId + " TEXT PRIMARY KEY, " +
	UserFieldUsername + " TEXT UNIQUE, " +
	UserFieldPasswordHash + " BLOB NOT NULL, " +
	UserFieldExperience + " INTEGER NOT NULL, " +
	UserFieldGuessHistory + " BLOB NOT NULL, " +
	UserFieldSettings + " BLOB NOT NULL" + ")"

const sql_string_CREATE_USERNAME_INDEX = `CREATE UNIQUE INDEX if NOT EXISTS index_username ON ` + UserTableName + "(" + UserFieldUsername + ")"

const sql_string_CREATE_FRIEND_TABLE = "CREATE TABLE if NOT EXISTS " + FriendTableName + " ( " +
	FriendFieldId1 + " TEXT, " +
	FriendFieldId2 + " TEXT, " +
	"FOREIGN KEY (" + FriendFieldId1 + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")," +
	"FOREIGN KEY (" + FriendFieldId1 + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")," +
	"constraint PK_FRIEND_TABLE PRIMARY KEY (" + FriendFieldId1 + "," + FriendFieldId2 + "))"

const sql_string_CREATE_FRIEND_INDEX_1 = "CREATE INDEX if NOT EXISTS index_id_1 ON " + FriendTableName + "(" + FriendFieldId1 + ")"

const sql_string_CREATE_FRIEND_INDEX_2 = "CREATE INDEX if NOT EXISTS index_id_1 ON " + FriendTableName + "(" + FriendFieldId2 + ")"

const sql_string_CREATE_FRIEND_REQUESTS_TABLE = "CREATE TABLE if NOT EXISTS " + FriendRequestTableName + " ( " + FriendRequestFieldSendingId + " TEXT, " +
	FriendRequestFieldReceivingId + " TEXT, " +
	"FOREIGN KEY (" + FriendRequestFieldSendingId + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")" +
	"FOREIGN KEY (" + FriendRequestFieldReceivingId + ") REFERENCES " + UserTableName + "(" + UserFieldId + ")," +
	"constraint PK_FRIEND_REQUEST_TABLE PRIMARY KEY (" + FriendRequestFieldSendingId + "," + FriendRequestFieldReceivingId + "))"

const sql_string_CREATE_SENDING_ID_INDEX = "CREATE INDEX if NOT EXISTS index_sending_id ON " + FriendRequestTableName + "(" + FriendRequestFieldSendingId + ")"

const sql_string_CREATE_RECEIVING_ID_INDEX = "CREATE INDEX if NOT EXISTS index_receiving_id ON " + FriendRequestTableName + "(" + FriendRequestFieldReceivingId + ")"

// idk just for use in initing
type StatementExecuter struct {
	database *sql.DB
	err      error
}

func (s *StatementExecuter) exec(sql_string string) {
	if s.err != nil {
		return
	}
	_, s.err = s.database.Exec(sql_string)
}

func InitializeDB(filepath string) error {	
	if _, err := os.Stat("./" + filepath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			f, err := os.Create("./" + filepath)
			if err != nil {
				return err
			}
			f.Close()
		} else {
			return err
		}
	}
	var err error
	Database, err = sql.Open("sqlite3", "./"+filepath+"?_fk=on")
	if err != nil {
		return err
	}
	/*row := Database.QueryRow("PRAGMA foreign_keys")
	var check int
	if err := row.Scan(&check); err != nil {
		return err
	}
	println(check)*/
	statement_executer := StatementExecuter{database: Database}
	statement_executer.exec(sql_string_CREATE_USER_TABLE)
	statement_executer.exec(sql_string_CREATE_USERNAME_INDEX)
	statement_executer.exec(sql_string_CREATE_FRIEND_TABLE)
	statement_executer.exec(sql_string_CREATE_FRIEND_INDEX_1)
	statement_executer.exec(sql_string_CREATE_FRIEND_INDEX_2)
	statement_executer.exec(sql_string_CREATE_FRIEND_REQUESTS_TABLE)
	statement_executer.exec(sql_string_CREATE_SENDING_ID_INDEX)
	statement_executer.exec(sql_string_CREATE_RECEIVING_ID_INDEX)
	if statement_executer.err != nil {
		return statement_executer.err
	}

	return nil
}
