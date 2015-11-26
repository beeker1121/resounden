package main

import(
	"fmt"
	"github.com/beeker1121/resounden/server"
	"github.com/beeker1121/resounden/utils"
)

func main() {
	fmt.Println("Starting Resounden...")
	fmt.Println("Reading config.json...")

	config, err := utils.ParseConfigFile()
	if err != nil {
		fmt.Println("Failed to read config.json")
	}

	fmt.Println("Using API ID: " + config.SoundcloudClientID)

	server.NewServer(config)
}