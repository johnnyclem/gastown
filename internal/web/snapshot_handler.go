package web

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

// TownStateEngine maintains a snapshot of the town state for API reads.
type TownStateEngine struct {
	fetcher   ConvoyFetcher
	stateMu   sync.RWMutex
	state     TownState
	updatedAt time.Time
}

// NewTownStateEngine creates a TownStateEngine backed by the given fetcher.
func NewTownStateEngine(fetcher ConvoyFetcher) *TownStateEngine {
	return &TownStateEngine{
		fetcher: fetcher,
	}
}

// Refresh rebuilds the cached town state snapshot from the fetcher.
func (e *TownStateEngine) Refresh() error {
	convoys, err := e.fetcher.FetchConvoys()
	if err != nil {
		return err
	}

	polecats, err := e.fetcher.FetchPolecats()
	if err != nil {
		polecats = nil
	}

	state := TownStateFromConvoyData(convoys, polecats)

	e.stateMu.Lock()
	e.state = state
	e.updatedAt = time.Now()
	e.stateMu.Unlock()

	return nil
}

// Snapshot returns the current town state snapshot.
func (e *TownStateEngine) Snapshot() TownState {
	e.stateMu.RLock()
	defer e.stateMu.RUnlock()

	return e.state
}

// TownSnapshotHandler serves the town snapshot API endpoint.
type TownSnapshotHandler struct {
	engine *TownStateEngine
}

// NewTownSnapshotHandler creates a new snapshot handler.
func NewTownSnapshotHandler(engine *TownStateEngine) *TownSnapshotHandler {
	return &TownSnapshotHandler{engine: engine}
}

// ServeHTTP handles GET /api/town/snapshot requests.
func (h *TownSnapshotHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := h.engine.Refresh(); err != nil {
		http.Error(w, "Failed to build town snapshot", http.StatusInternalServerError)
		return
	}

	snapshot := h.engine.Snapshot()

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(snapshot); err != nil {
		http.Error(w, "Failed to encode snapshot", http.StatusInternalServerError)
		return
	}
}
