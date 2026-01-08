package web

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed frontend/*
var frontendFS embed.FS

// NewTownFrontendHandler serves the town frontend assets.
func NewTownFrontendHandler() (http.Handler, error) {
	subFS, err := fs.Sub(frontendFS, "frontend")
	if err != nil {
		return nil, err
	}
	return http.FileServer(http.FS(subFS)), nil
}
