package web

import "testing"

func TestTownStateFromConvoyData(t *testing.T) {
	data := ConvoyData{
		Convoys: []ConvoyRow{
			{
				ID:     "hq-cv-123",
				Title:  "Ship frontend",
				Status: "open",
				TrackedIssues: []TrackedIssue{
					{ID: "fe-1", Title: "Landing page", Status: "in_progress"},
				},
			},
		},
		Polecats: []PolecatRow{
			{Name: "nux", Rig: "gastown", StatusHint: "reviewing prs"},
		},
	}

	state := TownStateFromConvoyData(data)

	if len(state.Jobs) != 1 {
		t.Fatalf("expected 1 job, got %d", len(state.Jobs))
	}
	if state.Jobs[0].Status != JobStatusInProgress {
		t.Fatalf("expected job status %q, got %q", JobStatusInProgress, state.Jobs[0].Status)
	}

	if len(state.Agents) != 1 {
		t.Fatalf("expected 1 agent, got %d", len(state.Agents))
	}
	if state.Agents[0].Status != AgentStatusReviewing {
		t.Fatalf("expected agent status %q, got %q", AgentStatusReviewing, state.Agents[0].Status)
	}
}
