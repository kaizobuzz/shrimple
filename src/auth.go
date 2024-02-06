package src

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
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
    userid int64
    expiration time.Time
}

type Token struct {
    tokendata TokenData
    signature []byte
}

func Tokenfromdata(data TokenData) (*Token, error){
    signature, err := SignTokenData(data)   
    if err != nil {
        return nil, err
    }
    return &Token{
        tokendata: data,
        signature: signature,
    }, nil
}

func SignTokenData(data TokenData) ([]byte, error) {
    var hash = sha256.Sum256([]byte(fmt.Sprint(data)))
    if SERVER_PRITAVE_KEY == nil {
        err := generate_private_key()
        if err != nil {
            return nil, err
        }
    }
    signature, err := rsa.SignPKCS1v15(nil, SERVER_PRITAVE_KEY, crypto.SHA256, hash[0:])
    if err != nil {
        return nil, err
    }

    return signature, nil

    
}
