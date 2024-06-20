package src

import (
	"context"
	"net/http"
	"shrimple/src/database"
	"shrimple/src/templates"
)

func UserCardHandler(w http.ResponseWriter, r *http.Request) {
	var id *string = LoggedInUser(r)
	if id == nil {
        templates.UserCard(false, "", "").Render(context.Background(), w) 
	} else {
        user, err:=database.SelectUsernameFromId(*id)
        if err!=nil{
            w.WriteHeader(http.StatusInternalServerError)
        }
        templates.UserCard(true, *id, user).Render(context.Background(), w) 
	}
}
