package iosdev

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDetectProjectFindsIndicators(t *testing.T) {
	tmp := t.TempDir()
	if err := os.Mkdir(filepath.Join(tmp, "App.xcodeproj"), 0755); err != nil {
		t.Fatalf("create xcodeproj: %v", err)
	}
	if err := os.WriteFile(filepath.Join(tmp, "Podfile"), []byte("pod"), 0644); err != nil {
		t.Fatalf("write Podfile: %v", err)
	}

	result, err := DetectProject(tmp, DefaultDetectionOptions())
	if err != nil {
		t.Fatalf("DetectProject error: %v", err)
	}
	if !result.IsIOSProject {
		t.Fatalf("expected iOS project to be detected")
	}
	if len(result.Matches) == 0 {
		t.Fatalf("expected at least one match")
	}
}

func TestDetectProjectNoIndicators(t *testing.T) {
	tmp := t.TempDir()
	result, err := DetectProject(tmp, DefaultDetectionOptions())
	if err != nil {
		t.Fatalf("DetectProject error: %v", err)
	}
	if result.IsIOSProject {
		t.Fatalf("expected no iOS indicators")
	}
}

func TestResolveModeOverride(t *testing.T) {
	force := true
	decision, err := ResolveMode("/tmp", ModeSettings{Override: &force, AutoDetect: true})
	if err != nil {
		t.Fatalf("ResolveMode error: %v", err)
	}
	if !decision.Enabled {
		t.Fatalf("expected override to enable mode")
	}
	if decision.Source != "override" {
		t.Fatalf("expected override source, got %s", decision.Source)
	}
}
