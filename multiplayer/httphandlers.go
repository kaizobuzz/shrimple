package multiplayer

import "net/http"

func ultiplayerHandlers(){
    http.HandleFunc("/api/v1/randomshrimp", RandomShrimpName)
    http.HandleFunc("/api/v1/sendevents", AddNewEvents)
    http.HandleFunc("/api/v1/getevents", CheckForEvents) 
}
