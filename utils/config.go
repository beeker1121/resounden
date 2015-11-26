package utils

import (
	"errors"
	"io/ioutil"
	"encoding/json"
)

type Config struct {
	SoundcloudClientID string `json:soundcloudClientID`
}

func ParseConfigFile() (Config, error) {
	var configJSON Config

	file, err := ioutil.ReadFile("config.json")
	if err != nil {
		return configJSON, errors.New("Could not find config.json file")
	}

	if err := json.Unmarshal(file, &configJSON); err != nil {
		return configJSON, errors.New("Failed to Unmarshal JSON into struct")
	}

	return configJSON, nil
}