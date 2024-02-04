package src

import (
	"log"
	"net/http"
	"shrimple/multiplayer"
	"shrimple/src/shared"
)

func Start_Server() {
	Initialize()

	port := "17212"
	fileServer := http.FileServer(http.Dir("./static"))
    multiplayer.MultiplayerHandlers()
	http.Handle("/", fileServer)
	http.HandleFunc("/test", testHandler)
	http.HandleFunc("/dailyshrimp", DailyShrimpName)
	http.HandleFunc("/signup", AccountCreationHandler)
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
