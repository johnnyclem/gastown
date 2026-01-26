package iosdev

import "testing"

func TestDetectUIImpactYes(t *testing.T) {
	result := DetectUIImpact([]string{"Sources/HomeView.swift", "README.md"})
	if result.Level != ImpactYes {
		t.Fatalf("expected ImpactYes, got %s", result.Level)
	}
	if len(result.Matches) == 0 {
		t.Fatalf("expected matches for UI impact")
	}
}

func TestDetectUIImpactNo(t *testing.T) {
	result := DetectUIImpact([]string{"Docs/notes.txt", "scripts/build.sh"})
	if result.Level != ImpactNo {
		t.Fatalf("expected ImpactNo, got %s", result.Level)
	}
}

func TestDetectUIImpactUnknown(t *testing.T) {
	result := DetectUIImpact(nil)
	if result.Level != ImpactUnknown {
		t.Fatalf("expected ImpactUnknown, got %s", result.Level)
	}
}
