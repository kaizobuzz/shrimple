package src

import (
	"net/http"
)

func testHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("meow"))
}
