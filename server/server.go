package server

import (
	"fmt"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/beeker1121/resounden/api"
	"github.com/beeker1121/resounden/utils"
)

func handleNoWWW(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	http.Redirect(w, r, "http://" + params["domain"] + ".com", 301)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/index.html")
}

func handleStatic(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "public/" + r.URL.Path)
}

func handleNotFound(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/404.html")
}

func NewServer(config utils.Config) {
	fmt.Println("Creating new server on port 80")

	// Create new router
	router := mux.NewRouter()

	// Force no WWW
	router.HandleFunc("/", handleNoWWW).Host("www.{domain}.com")

	// Serve index
	router.HandleFunc("/", handleIndex)

	// Serve CSS
	router.HandleFunc("/css/style.css", handleStatic)

	// Serve JavaScript
	router.HandleFunc("/js/react-dom.min.js", handleStatic)
	router.HandleFunc("/js/react-with-addons.min.js", handleStatic)
	router.HandleFunc("/js/resounden.js", handleStatic)
	router.HandleFunc("/js/resounden-utils.js", handleStatic)

	// Handle API routes
	api.NewAPI(router, config.SoundcloudClientID)

	// Handle not found
	router.NotFoundHandler = http.HandlerFunc(handleNotFound)

	// Set the router
	http.Handle("/", router)

	// Start the server
	fmt.Println("Listening...")
	http.ListenAndServe(":80", nil)
}