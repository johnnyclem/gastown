package iosdev

import (
	"fmt"
)

// ModeDecision captures the final enablement state for iOS Dev mode.
type ModeDecision struct {
	Enabled bool
	Source  string
	Reason  string
	Matches []IndicatorMatch
}

// ModeSettings configures how iOS Dev mode is resolved.
type ModeSettings struct {
	// Override, when non-nil, forces enable or disable.
	Override *bool
	// AutoDetect controls whether repo detection is used.
	AutoDetect bool
}

// ResolveMode determines whether iOS Dev mode should be enabled.
func ResolveMode(root string, settings ModeSettings) (ModeDecision, error) {
	if settings.Override != nil {
		return ModeDecision{
			Enabled: *settings.Override,
			Source:  "override",
			Reason:  "manual override",
		}, nil
	}

	if !settings.AutoDetect {
		return ModeDecision{
			Enabled: false,
			Source:  "config",
			Reason:  "auto-detect disabled",
		}, nil
	}

	detect, err := DetectProject(root, DefaultDetectionOptions())
	if err != nil {
		return ModeDecision{}, err
	}
	if !detect.IsIOSProject {
		return ModeDecision{
			Enabled: false,
			Source:  "auto",
			Reason:  "no iOS indicators found",
		}, nil
	}

	reason := "iOS indicators detected"
	if len(detect.Matches) > 0 {
		reason = fmt.Sprintf("iOS indicators detected (%d matches)", len(detect.Matches))
	}

	return ModeDecision{
		Enabled: true,
		Source:  "auto",
		Reason:  reason,
		Matches: detect.Matches,
	}, nil
}
