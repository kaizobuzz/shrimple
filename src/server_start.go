package src

import (
	"fmt"
	"log"
	"net/http"
	"shrimple/multiplayer"
	"shrimple/src/database"
	"shrimple/src/shared"
)

var getNilrem=shared.GetNilrem

func Start_Server() {
	Initialize()
	fmt.Print(SERVER_PRITAVE_KEY)
	port := "17212"
	fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/", fileServer)
	multiplayer.MultiplayerHandlers()
	http.HandleFunc("/api/v1/test", testHandler)
	http.HandleFunc("/api/v1/dailyshrimp", DailyShrimpName)
	http.HandleFunc("/api/v1/signup", AccountCreationHandler)
	http.HandleFunc("/api/v1/login", LoginHandler)
	http.HandleFunc("/api/v1/usercard", UserCardHandler)
	http.HandleFunc("/api/v1/userinfo", UserInfoHandler)
    http.HandleFunc("/api/v1/usersettings", getUserSettings)
	http.HandleFunc("/api/v1/postguesshistoryentry", GuessHistoryEntryReciever)
	http.HandleFunc("/api/v1/getguesshistoryentry", GetGuessHistoryEntry)
    http.HandleFunc("/api/v1/logout", LogoutHandler)
	println("Starting Server on port " + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func Initialize() {
    if nilrem:=getNilrem(); nilrem!=nil{
        log.Fatal(nilrem)
    }
	if err := database.InitializeDB("data/users.db"); err != nil {
		log.Fatal(err)
	}
	if err := database.PrepareStatements(database.Database); err != nil {
		log.Fatal(err)
	}
	multiplayer.IntializeMap()
	GetPepper()
	if err := shared.GetShrimpJson(); err != nil {
		log.Fatal(err)
	}
}
