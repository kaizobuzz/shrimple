package src

import (
	"log"
	"net/http"
)

func Start_Server() {
	port := "17212"
	fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/", fileServer)
	http.HandleFunc("/test", testHandler)
	http.HandleFunc("/shrimps", GetShrimps)
	http.HandleFunc("/dailyshrimp", DailyShrimpName)
	println("Starting Server on port " + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
