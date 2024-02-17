package multiplayer

import "net/http"

func MultiplayerHandlers(){
    http.HandleFunc("/randomshrimp", RandomShrimpName)
    http.HandleFunc("/sendevents", AddNewEvents)
    http.HandleFunc("/getevents", CheckForEvents) 
}
