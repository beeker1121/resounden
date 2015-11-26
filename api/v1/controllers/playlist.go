package controllers

import (
	"io/ioutil"
	"encoding/json"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/beeker1121/resounden/api/v1/utils"
	"github.com/beeker1121/resounden/api/v1/models"
)

type PlaylistController struct {
	APIKey string
}

func NewPlaylistController(apiKey string) *PlaylistController {
	return &PlaylistController{apiKey}
}

func (p *PlaylistController) Register(router *mux.Router) {
	router.HandleFunc("/api/v1/playlist/", p.getPlaylist)
	router.HandleFunc("/api/v1/playlist/{username}", p.getPlaylist)
}

func (p *PlaylistController) getPlaylist(w http.ResponseWriter, r *http.Request) {
	// Get the request variables
	vars := mux.Vars(r)

	// If the next_href param was passed to us, use that for the URL
	nextHref := r.URL.Query().Get("next_href")

	if nextHref == "" {
		nextHref = "http://api.soundcloud.com/users/" + vars["username"] + "/favorites?client_id=" + p.APIKey + "&linked_partitioning=1"
	}

	// Call the Soundcloud API
	resp, err := http.Get(nextHref)
	defer resp.Body.Close()
	if err != nil {
		utils.WriteError(utils.Error{404, "User not found"}, w)
		return
	}

	// Store the body of the response, using ioutil since it's a stream
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		utils.WriteError(utils.Error{500, "Internal server error"}, w)
		return
	}

	// Check for an error response first
	var jsonError utils.Errors

	// If we can decode this json into our Errors struct type
	if json.Unmarshal(body, &jsonError); len(jsonError.Errors) > 0 {
		utils.WriteError(utils.Error{404, "Member could not be found"}, w)
		return
	}

	// Try decoding it into our Collection type
	var collection models.Collection

	// If we can't decode this json into our struct type
	if err := json.Unmarshal(body, &collection); err != nil {
		utils.WriteError(utils.Error{500, "Can't decode JSON into struct type"}, w)
		return
	}

	// Append the Soundcloud Client ID to stream_url for each track
	for i, _ := range collection.Collection {
		collection.Collection[i].StreamURL += "?client_id=" + p.APIKey
	}

	// Encode our Collection struct as a json string and send
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collection)
}