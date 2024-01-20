package src 
import(
    "net/http"	
    "log"
)
func Start_Server(){
    port := "17212"
    fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/", fileServer)
    http.HandleFunc("/test", testHandler)
    http.HandleFunc("/shrimps", GetShrimps)
    print("Starting Server on port " + port)
    if err := http.ListenAndServe(":" + port, nil); err != nil{ 
	    log.Fatal(err)
    }
}
