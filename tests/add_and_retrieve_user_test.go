package tests

import (
	"bytes"
	"fmt"
	"os"
	"shrimple/src/database"
	"shrimple/src/shared"
	"slices"
	"testing"
	"time"
)

func SliceUnstableEqual[T comparable](slice []T, other_slice []T) bool {
	for _, object := range slice {
		if !slices.Contains(other_slice, object) {
			return false
		}
	}
	return true
}
func TestAddingUser(t *testing.T) {
	_, err := os.Create("test_data/test.db")
	if err != nil {
		t.Fatal(err)
	}
	var id string = "302"
	var username string = "thing"
	if err := database.InitializeDB("test_data/test.db"); err != nil {
		t.Fatal(err)
	}
	if err := database.PrepareStatements(database.Database); err != nil {
		t.Fatal(err)
	}
	first_var := User{
		Username:     username,
		Id:           id,
		PasswordHash: shared.HashSalt{Salt: []byte("yeah"), Hash: []byte("idk")},
		Experience:   0,
		Friends: []string{
			"3",
			"5",
			"7",
			"312948721894",
			"4214",
			"13",
			"4",
			"1525",
			"14143",
			"156413",
			"1414243",
			"15256",
			"13837",
			"12142421",
			"1259879",
		},
		IncomingFriendRequests: []string{},
		OutgoingFriendRequests: []string{},
		GuessHistory:           make(map[string]map[int64]int),
	}
	first_var.GuessHistory["shrimple"] = make(map[int64]int)
	first_var.GuessHistory["clamplicated"] = make(map[int64]int)
	for i := 0; i < 100; i++ {
		first_var.GuessHistory["shrimple"][int64(i+24000)] = i
		first_var.GuessHistory["clamplicated"][int64(i+40000)] = i
	}
	for _, friend_id := range first_var.Friends {
		next_var := User{
			Username: fmt.Sprint(friend_id) + "idk",
			Id:       friend_id,

			PasswordHash:           shared.HashSalt{Salt: []byte("yeah"), Hash: []byte("idk")},
			Experience:             0,
			Friends:                []string{},
			IncomingFriendRequests: []string{},
			OutgoingFriendRequests: []string{},
			GuessHistory:           make(map[string]map[int64]int),
		}
		if err := database.AddNewUser(&next_var); err != nil {
			t.Fatal(err)
		}
	}
	next_var := User{
		Username: fmt.Sprint(2138) + "idk",
		Id:       "2138",
		PasswordHash:           shared.HashSalt{Salt: []byte("yeah"), Hash: []byte("idk")},
		Experience:             0,
		Friends:                []string{},
		IncomingFriendRequests: []string{},
		OutgoingFriendRequests: []string{},
		GuessHistory:           make(map[string]map[int64]int),
	}
	if err := database.AddNewUser(&next_var); err != nil {
		t.Fatal(err)
	}
	if err := database.AddNewUser(&first_var); err != nil {
		t.Fatal(err)
	}
	second_var, err := database.SelectFullUserFromId(id)
	if err != nil {
		t.Fatal(err)
	}
	if !SliceUnstableEqual(second_var.OutgoingFriendRequests, first_var.OutgoingFriendRequests) {
		t.Fatal(second_var.OutgoingFriendRequests, first_var.OutgoingFriendRequests)
	}
	if !SliceUnstableEqual(second_var.IncomingFriendRequests, first_var.IncomingFriendRequests) {
		t.Fatal(second_var.IncomingFriendRequests, first_var.IncomingFriendRequests)
	}
	if !SliceUnstableEqual(second_var.Friends, first_var.Friends) {
		t.Fatal(second_var.Friends, first_var.Friends)
	}
	if fmt.Sprint(first_var.GuessHistory) != fmt.Sprint(second_var.GuessHistory) {
		t.Fatal(second_var.GuessHistory, first_var.GuessHistory)
	}
	second_var, err = database.SelectFullUserFromUsername(username)
	if err != nil {
		t.Fatal(err)
	}
	if !SliceUnstableEqual(second_var.Friends, first_var.Friends) {
		t.Fatal(second_var.Friends, first_var.Friends)
	}
	if fmt.Sprint(first_var.GuessHistory) != fmt.Sprint(second_var.GuessHistory) {
		t.Fatal(second_var.GuessHistory, first_var.GuessHistory)
	}
	password_hash, err := database.SelectAuthenticationFieldsFromUsername(username)
	if err != nil {
		t.Fatal(second_var.Username, err)
	}
	if !bytes.Equal(password_hash.Hash, first_var.PasswordHash.Hash) {
		t.Fatal("idk")
	}
	test_slice, err := database.GetUsernameListFromIdList(first_var.Friends)
	if len(test_slice) != len(first_var.Friends) {
		t.Fatal(test_slice, len(test_slice), len(first_var.Friends))
	}
	if err != nil {
		t.Fatal(err)
	}
	current_time := time.Now()
	//Okay this is like slow it takes a whole 8ms
	if err := database.UpdateFriendRequests(id, "2138", database.SentRequest); err != nil {
		t.Fatal(err)
	}
	t.Log(time.Since(current_time).Milliseconds(), "\n")
	if err := database.UpdateFriendRequests(id, "2138", database.AcceptedRequest); err != nil {
		t.Fatal(err)
	}
	//Okay this is like slow it takes a whole 12ms
	t.Log(time.Since(current_time).Milliseconds(), "\n")

	second_var, err = database.SelectFullUserFromId("2138")

	t.Log(time.Since(current_time).Milliseconds(), "\n")
	if err != nil {
		t.Fatal(err)
	}
	if !slices.Contains(second_var.Friends, id) {
		t.Fatal(second_var.Friends)
	}
	slice, err := database.SearchForUsernames("hin")
	if err != nil {
		t.Fatal(err)
	}
	if len(slice) != 1 {
		t.Fatal(len(slice), slice)
	}
}
