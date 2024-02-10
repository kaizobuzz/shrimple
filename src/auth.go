package src

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	//"encoding/base64"
	"fmt"
	"time"
)

var SERVER_PRITAVE_KEY *rsa.PrivateKey; 

func generate_private_key() error {
    if SERVER_PRITAVE_KEY != nil {
        return nil 
    }
    key, err := rsa.GenerateKey(rand.Reader, 1024)
    if err != nil {
        return err
    }
    SERVER_PRITAVE_KEY = key
    return nil
}

type TokenData struct{
    Username string 
    Expiration time.Time
}

type Token struct {
    Tokendata TokenData
    Signature []byte
    Signed_password []byte
}

func Tokenfromdata(data TokenData) (*Token, error){
    Signature, err := SignTokenData(data)   
    if err != nil {
        return nil, err
    }
    var passwordhash = sha256.Sum256([]byte(UserMap[data.Username].PasswordHash))
    signed_password, err := SignWithServerPrivateKey(passwordhash)
    if err != nil {
        return nil, err
    }
    return &Token{
        Tokendata: data,
        Signature: Signature,
        Signed_password: signed_password,
    }, nil
}

func SignTokenData(data TokenData) ([]byte, error) {
    var hash = sha256.Sum256([]byte(fmt.Sprint(data)))
    return SignWithServerPrivateKey(hash)
}

func SignWithServerPrivateKey(data [32]byte) ([]byte, error) {
    if SERVER_PRITAVE_KEY == nil {
        err := generate_private_key()
        if err != nil {
            return nil, err
        }
    }
    Signature, err := rsa.SignPKCS1v15(nil, SERVER_PRITAVE_KEY, crypto.SHA256, data[0:])
    if err != nil {
        return nil, err
    }

    return Signature, nil
}
