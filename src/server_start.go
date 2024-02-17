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
	http.HandleFunc("/test", testHandler)
	http.HandleFunc("/dailyshrimp", DailyShrimpName)
	http.HandleFunc("/signup", AccountCreationHandler)
    http.HandleFunc("/login", LoginHandler)
    http.HandleFunc("/usercard", UserCardHandler)
	println("Starting Server on port " + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func Initialize() {
	GetPepper()
    if err:= shared.GetShrimpJson(); err!=nil{
        log.Fatal(err)
    }
	if err := ReadUsersFromFile(); err!=nil{
        log.Fatal(err)
    }	
}
