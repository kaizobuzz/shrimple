package multiplayer

import "net/http"

func MultiplayerHandlers() {
	http.HandleFunc("/api/v1/randomshrimp", RandomShrimpName)
	http.HandleFunc("/api/v1/sendevents", AddNewEvent)
	http.HandleFunc("/api/v1/getevents", CheckForEvents)
	http.HandleFunc("/api/v1/getgameid", GiveNewGameId)
}
