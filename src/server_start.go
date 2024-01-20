package src 
import(
    "net/http"	
    "log"
)
func Start_Server(){
    fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/", fileServer)
    http.HandleFunc("/test", testHandler)
    if err := http.ListenAndServe(":17212", nil); err != nil{ 
	    log.Fatal(err)
    }
}
