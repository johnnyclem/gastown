package iosdev

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// Screenshot captures a simulator screenshot with metadata.
type Screenshot struct {
	Device     SimulatorDevice
	Path       string
	CapturedAt time.Time
}

// ScreenshotWorkflow handles before/after screenshot capture.
type ScreenshotWorkflow struct {
	Controller     SimulatorController
	ScreenshotsDir string
	Devices        []SimulatorSpec
}

// CaptureScreenshots boots simulators, launches the app, and captures screenshots.
func (w ScreenshotWorkflow) CaptureScreenshots(ctx context.Context, label, bundleID, appPath string) ([]Screenshot, error) {
	if w.Controller == nil {
		w.Controller = PreferredController()
	}
	if w.ScreenshotsDir == "" {
		w.ScreenshotsDir = filepath.Join("screenshots", "ios")
	}
	if len(w.Devices) == 0 {
		w.Devices = DefaultSimulatorSpecs()
	}

	if err := os.MkdirAll(w.ScreenshotsDir, 0755); err != nil {
		return nil, fmt.Errorf("create screenshots dir: %w", err)
	}

	var shots []Screenshot
	for _, spec := range w.Devices {
		device, err := w.Controller.EnsureBooted(ctx, spec)
		if err != nil {
			return shots, fmt.Errorf("boot simulator (%s): %w", spec.Device, err)
		}

		if appPath != "" {
			if err := w.Controller.InstallApp(ctx, device.UDID, appPath); err != nil {
				return shots, err
			}
		}

		if bundleID != "" {
			if err := w.Controller.LaunchApp(ctx, device.UDID, bundleID, nil); err != nil {
				return shots, err
			}
		}

		filename := fmt.Sprintf("%s-%s.png", sanitizeLabel(label), sanitizeLabel(device.Name))
		path := filepath.Join(w.ScreenshotsDir, filename)
		if err := w.Controller.Screenshot(ctx, device.UDID, path); err != nil {
			return shots, err
		}
		shots = append(shots, Screenshot{
			Device:     device,
			Path:       path,
			CapturedAt: time.Now(),
		})
	}

	return shots, nil
}

func sanitizeLabel(input string) string {
	if input == "" {
		return "shot"
	}
	out := make([]rune, 0, len(input))
	for _, r := range input {
		switch {
		case r >= 'a' && r <= 'z':
			out = append(out, r)
		case r >= 'A' && r <= 'Z':
			out = append(out, r)
		case r >= '0' && r <= '9':
			out = append(out, r)
		case r == '-' || r == '_':
			out = append(out, r)
		case r == ' ':
			out = append(out, '-')
		}
	}
	if len(out) == 0 {
		return "shot"
	}
	return string(out)
}
