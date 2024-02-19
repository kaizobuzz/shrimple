package src

import (
	"fmt"
	"log"
	"net/http"
	"shrimple/src/shared"
    "shrimple/multiplayer"
)

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
	println("Starting Server on port " + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func Initialize() {
    multiplayer.IntializeMap()
	GetPepper()
    if err:= shared.GetShrimpJson(); err!=nil{
        log.Fatal(err)
    }
	if err := ReadUsersFromFile(); err!=nil{
        log.Fatal(err)
    }	
}
