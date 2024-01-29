package src

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"os"
)
var pepper string

func hashPassword(username, password string) string{
    if len(pepper)==0{
        log.Fatal(errors.New("pepper too short (0 chars)"))
    }
    password=password+pepper
    hash:=sha256.Sum256([]byte(password))
    return hex.EncodeToString(hash[:])
}

func verifyPassword(username, password string) bool{
    hash:=hashPassword(username, password)
    if UserMap[username].PasswordHash==hash{
        return true;
    }
    return false;
}
func GetPepper(){
    pepperbyte, err:=os.ReadFile("data/pepper")
    pepper=string(pepperbyte);
    if len(pepper)==0{
        log.Fatal(errors.New("pepper too short (0 chars)"))
    }
    if err!=nil{
        log.Fatal(err)
    }
}
