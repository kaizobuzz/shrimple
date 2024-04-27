package src

import (
	"fmt"
	"net/http"
)

func UserCardHandler(w http.ResponseWriter, r *http.Request) {
	//TODO: this function was written to test stuff and is therefore put together rather sloppily
	var user *string = LoggedInUser(r)
	if user == nil {
		// not logged in
		fmt.Println("Logged in user: *nil")
		w.Write([]byte("Not Logged In"))
	} else {
		// logged in user
		fmt.Printf("Logged in user: %s", *user)
		w.Write([]byte(fmt.Sprintf("Logged In as %s", *user)))
        // the fmt.Sprintf allows for XSS so this should eventually be changed into a tempalte
	}
}
