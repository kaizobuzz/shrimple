package src

import (
	"crypto/sha256"
	"encoding/hex"
)

func hashPassword(username, password string) string{
    password=password+"somepepperprobablytodoandalsotheesalt"
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
