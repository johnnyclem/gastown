package web

import (
	"encoding/json"
	"net/http"
)

// TownSnapshotHandler serves a JSON snapshot of the town state.
type TownSnapshotHandler struct {
	fetcher ConvoyFetcher
}

// NewTownSnapshotHandler creates a handler for /api/town/snapshot.
func NewTownSnapshotHandler(fetcher ConvoyFetcher) *TownSnapshotHandler {
	return &TownSnapshotHandler{fetcher: fetcher}
}

// ServeHTTP handles GET /api/town/snapshot.
func (h *TownSnapshotHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	convoys, err := h.fetcher.FetchConvoys()
	if err != nil {
		http.Error(w, "Failed to fetch convoys", http.StatusInternalServerError)
		return
	}

	mergeQueue, err := h.fetcher.FetchMergeQueue()
	if err != nil {
		mergeQueue = nil
	}

	polecats, err := h.fetcher.FetchPolecats()
	if err != nil {
		polecats = nil
	}

	state := TownStateFromConvoyData(ConvoyData{
		Convoys:    convoys,
		MergeQueue: mergeQueue,
		Polecats:   polecats,
	})

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if err := json.NewEncoder(w).Encode(state); err != nil {
		http.Error(w, "Failed to encode snapshot", http.StatusInternalServerError)
		return
	}
}
