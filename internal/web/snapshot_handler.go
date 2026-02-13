package web

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"regexp"
	"strings"
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

    // --- CHANGE STARTS HERE ---
    // Wrap the separate slices into the ConvoyData struct expected by the new function signature
	data := ConvoyData{
		Convoys:  convoys,
		Polecats: polecats,
	}

	state := TownStateFromConvoyData(data)
    // --- CHANGE ENDS HERE ---

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

// setCORSHeaders sets standard CORS headers for API endpoints.
func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// MergeQueueHandler serves GET /api/merge-queue.
type MergeQueueHandler struct {
	fetcher ConvoyFetcher
}

// NewMergeQueueHandler creates a new merge queue handler.
func NewMergeQueueHandler(fetcher ConvoyFetcher) *MergeQueueHandler {
	return &MergeQueueHandler{fetcher: fetcher}
}

// ServeHTTP handles GET /api/merge-queue requests.
func (h *MergeQueueHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	queue, err := h.fetcher.FetchMergeQueue()
	if err != nil {
		http.Error(w, "Failed to fetch merge queue", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(queue)
}

// PolecatListHandler serves GET /api/polecats.
type PolecatListHandler struct {
	fetcher ConvoyFetcher
}

// NewPolecatListHandler creates a new polecat list handler.
func NewPolecatListHandler(fetcher ConvoyFetcher) *PolecatListHandler {
	return &PolecatListHandler{fetcher: fetcher}
}

// ServeHTTP handles GET /api/polecats requests.
func (h *PolecatListHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	polecats, err := h.fetcher.FetchPolecats()
	if err != nil {
		http.Error(w, "Failed to fetch polecats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"polecats": polecats,
	})
}

// paneSessionPattern validates tmux session names for the pane output endpoint.
var paneSessionPattern = regexp.MustCompile(`^gt-[a-zA-Z0-9_-]+$`)

// PaneOutputHandler serves GET /api/pane-output?session=NAME.
type PaneOutputHandler struct{}

// NewPaneOutputHandler creates a new pane output handler.
func NewPaneOutputHandler() *PaneOutputHandler {
	return &PaneOutputHandler{}
}

// ServeHTTP handles GET /api/pane-output requests.
func (h *PaneOutputHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	session := r.URL.Query().Get("session")
	if session == "" {
		http.Error(w, "Missing session parameter", http.StatusBadRequest)
		return
	}
	if !paneSessionPattern.MatchString(session) {
		http.Error(w, "Invalid session name", http.StatusBadRequest)
		return
	}

	// #nosec G204 -- session name validated against strict regex
	cmd := exec.Command("tmux", "capture-pane", "-t", session, "-p", "-J", "-S", "-50")
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	err := cmd.Run()

	resp := struct {
		SessionName string   `json:"session_name"`
		Lines       []string `json:"lines"`
		Error       string   `json:"error,omitempty"`
	}{
		SessionName: session,
	}

	if err != nil {
		resp.Error = fmt.Sprintf("Failed to capture pane: %v", err)
	} else {
		raw := strings.TrimRight(stdout.String(), "\n")
		if raw != "" {
			resp.Lines = strings.Split(raw, "\n")
		}
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(resp)
}
