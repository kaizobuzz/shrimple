package src

import (
	"context"
	"net/http"
	"shrimple/src/database"
	"shrimple/src/templates"
)

func UserCardHandler(w http.ResponseWriter, r *http.Request) {
	var user *string = LoggedInUser(r)
	if user == nil {
        templates.UserCard(false, "", "").Render(context.Background(), w) 
	} else {
        id, err:=database.SelectIdFromUsername(*user)
        if err!=nil{
            w.WriteHeader(http.StatusInternalServerError)
        }
        templates.UserCard(true, id, *user).Render(context.Background(), w) 
	}
}
