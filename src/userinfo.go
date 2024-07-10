package src

import (
	"context"
	"log"
	"net/http"
	"shrimple/src/database"
	"shrimple/src/shared"
	"shrimple/src/templates"
	"slices"
)

func UserInfoHandler(w http.ResponseWriter, r *http.Request) {
	//TODO check for privacy settings
	log.Println("Getting User Info!")
	user_id, err := getUserIdRefererVal(r)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if user_id == "" {
		if optional_user_id := LoggedInUser(r); optional_user_id != nil {
			user_id = *optional_user_id
		} else {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return

		}
	}
	user, err := GetUserById(user_id)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("No User With That ID!!"))
		return
	}
	if allowed, _ := checkAuthToViewWithSettings(r, user_id, &user.Settings); !allowed {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("No User With That ID!!"))
		return
	}
	templates.UserInfo(user).Render(context.Background(), w)
}
func checkAuthEqual(r *http.Request, id string) bool {
	user_id := LoggedInUser(r)
	if user_id == nil {
		return false
	}
	return *user_id == id
}

// side channel attack risk
func checkAuthToView(r *http.Request, id string) (allowed bool, statuscode int) {
	settings, err := database.SelectSettingsFromId(id)
	if err != nil {
		return false, http.StatusInternalServerError
	}
	return checkAuthToViewWithSettings(r, id, settings)
}

// side channel attack risk
func checkAuthToViewWithSettings(r *http.Request, id string, settings *shared.Settings) (allowed bool, statuscode int) {
	switch settings.Privacy.Page.ViewUserInfo {
	case shared.Private:
		if !checkAuthEqual(r, id) {
			return false, http.StatusForbidden
		}
	case shared.FriendsOnly:
		if checkAuthEqual(r, id) {
			return true, -1
		}
		friends, err := database.SelectFriendsFromId(id)
		if err != nil {
			return false, http.StatusInternalServerError
		}
		user_id := LoggedInUser(r)
		if user_id != nil {
			if slices.Contains(friends, *user_id) {
				return true, -1
			}
		}
		return false, http.StatusForbidden
	}
	return true, -1
}
