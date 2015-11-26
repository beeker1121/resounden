package api

import (
	"github.com/gorilla/mux"
	apiv1 "github.com/beeker1121/resounden/api/v1/controllers"
)

func NewAPI(router *mux.Router, apiKey string) {
	// Handle playlist
	playlist := apiv1.NewPlaylistController(apiKey)
	playlist.Register(router)
}