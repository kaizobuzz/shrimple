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
        templates.UserCard(false, -1, "").Render(context.Background(), w) 
	} else {
        id, _, err:=database.SelectAuthenticationFieldsFromUsername(*user)
        if err!=nil{
            w.WriteHeader(http.StatusInternalServerError)
        }
        templates.UserCard(true, id, *user).Render(context.Background(), w) 
	}
}
