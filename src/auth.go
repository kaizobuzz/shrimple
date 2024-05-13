package src

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"shrimple/src/database"
	"slices"
	"time"
)

var SERVER_PRITAVE_KEY *rsa.PrivateKey

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

type TokenData struct {
	Username        string
	Expiration      time.Time
	Signed_password []byte
}

type Token struct {
	Tokendata TokenData
	Signature []byte
}

func Tokenfromdata(data TokenData) (*Token, error) {
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
	json_token, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	var hash = sha256.Sum256(json_token)
	bytes, err := SignWithServerPrivateKey(hash)
	if err == nil {
		fmt.Printf("\n Signed Token: %x \n!! Signature: %x", data, bytes)
	}
	return bytes, err
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
	bytes, err := base64.StdEncoding.Decode(json_token, []byte(base64_token))
	json_token = json_token[:bytes]
	if err != nil {
		fmt.Printf("error decoding base64 in verifysessiontoken: %s", err)
		return nil, false, err
	}
	fmt.Printf("\n Got JSON token with value: %s (%x) \n", json_token, json_token)
	var token Token
	err = json.Unmarshal(json_token, &token)
	if err != nil {
		fmt.Printf("error unmarshalling json in verifysessiontoken: %s", err)
		fmt.Printf("here is the slice we tried to unmarshal: %x", json_token)
	}

	correct_token_signature, err := SignTokenData(token.Tokendata)
	if err != nil {
		fmt.Printf("Error signing token data in verifysessiontoken: %s", err)
		return nil, false, err
	}
	correct_password_signature, err := SignedPassword(token.Tokendata.Username)
	if err != nil {
		return nil, false, err
	}
	if token.Tokendata.Expiration.Before(time.Now()) {
		fmt.Print("Token Expired !! ")
		return nil, false, nil // token expired
	}
	if !slices.Equal(correct_token_signature, token.Signature) {
		fmt.Print("Token has incorrect signature!")
		return nil, false, nil
	}
	if !slices.Equal(correct_password_signature, token.Tokendata.Signed_password) {
		fmt.Print("Token has incorrect password signature!")
		return nil, false, nil
	}
	return &token.Tokendata.Username, true, nil
}

func SignedPassword(username string) ([]byte, error) {
    password_hash, err := database.SelectAuthenticationFieldsFromUsername(username)
	if err != nil {
		return nil, err
	}
    if len(password_hash.Hash)!=_ARGON2_KEYLENGTH{
        return nil, fmt.Errorf("password hash stored has wrong keylength, %d expected, %d found", _ARGON2_KEYLENGTH, len(password_hash.Hash))
    }
    //TODO make sure this is a safe conversion
	var password_hash_bytes = *(*[_ARGON2_KEYLENGTH]byte)(password_hash.Hash)
    return SignWithServerPrivateKey(password_hash_bytes)
}
