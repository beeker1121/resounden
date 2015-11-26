package utils

import(
	"encoding/json"
	"net/http"
)

type Errors struct {
	Errors []Error `json:"errors"`
}

type Error struct {
	Status 	int 	`json:"status"`
	Title 	string 	`json:"title"`
}

func WriteError(err Error, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.Status)
	json.NewEncoder(w).Encode(Errors{[]Error{err}})
}