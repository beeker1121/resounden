package models

type trackUser struct {
	Username string `json:"username"`
}

type track struct {
	Id int `json:"id"`
	Duration int `json:"duration"`
	Streamable bool `json:"streamable"`
	Title string `json:"title"`
	User trackUser `json:"user"`
	ArtworkURL string `json:"artwork_url"`
	StreamURL string `json:"stream_url"`
	PlaybackCount int `json:"playback_count"`
}

type playlist []track

type Collection struct {
	Collection playlist `json:"collection"`
	NextHref string `json:"next_href"`
}