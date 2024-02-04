package shared

import (
	"encoding/json"
	"os"
    "log"
)

const SHRIMP_DATA_PATH = "static/data/shrimps.json"

var ShrimpList ShrimpJson

type ShrimpData struct {
	Name       string
	Habitat    string
	Length     json.Number
	Coloration []string
	Weight     json.Number
	MaxDepth   json.Number
}
type ShrimpJson struct {
	Shrimps []ShrimpData
}

func GetShrimpJson() error {
	shrimps_json, err := os.ReadFile(SHRIMP_DATA_PATH)
	if err != nil {
		return err
	}
	err = json.Unmarshal(shrimps_json, &ShrimpList)
	log.Println("shrimplist: ", ShrimpList)
	return nil
}
