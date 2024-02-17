package src

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"slices"
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
    Signed_password []byte
}

type Token struct {
    Tokendata TokenData
    Signature []byte
}

func Tokenfromdata(data TokenData) (*Token, error){
    Signature, err := SignTokenData(data)   
    if err != nil {
        return nil, err
    }
    return &Token{
        Tokendata: data,
        Signature: Signature,
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

func VerifySessionToken(base64_token string) (*string /*username*/, bool /* valid */, error) {
    //fmt.Printf("base64 representation of token: %s", base64_token)
    var num_bytes int = base64.StdEncoding.DecodedLen(len([]byte(base64_token)))
    var json_token []byte = make([]byte, num_bytes)
    _, err := base64.StdEncoding.Decode(json_token, []byte(base64_token))
    if err != nil {
        return nil, false, err
    }

    var token Token;
    err = json.Unmarshal(json_token, &token)
    if err != nil {
        return nil, false, err
    }
    
    correct_token_signature, err := SignTokenData(token.Tokendata)
    if err != nil {
        return nil, false, err
    }
    correct_password_signature, err := SignedPassword(token.Tokendata.Username)
    if err != nil {
        return nil, false, err
    }
    if token.Tokendata.Expiration.Before(time.Now()) {
        return nil, false, nil // token expired
    }
    if !slices.Equal(correct_token_signature, token.Signature) {
        return nil, false, nil
    }
    if !slices.Equal(correct_password_signature, token.Tokendata.Signed_password) { 
        return nil, false, nil
    }
    return &token.Tokendata.Username, true, nil
}

func SignedPassword(username string) ([]byte, error) {
    var user = GetUserByName(username)
    if user == nil {
        return nil, errors.New("User does not exist")
    }
    var passwordhash = sha256.Sum256([]byte(user.PasswordHash))
    return SignWithServerPrivateKey(passwordhash)
}

