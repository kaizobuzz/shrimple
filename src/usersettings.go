package src

import (
	"net/http"
)


func checkForAuth(w http.ResponseWriter, r *http.Request) {
	id := LoggedInUser(r)
	if id == nil {
        http.Redirect(w, r, "/login.html", http.StatusSeeOther)
		return
	}
    w.WriteHeader(http.StatusNoContent)
}
