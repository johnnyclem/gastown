package iosdev

import (
	"path/filepath"
	"strings"
)

// UIImpactLevel describes the confidence of UI/UX impact.
type UIImpactLevel string

const (
	ImpactYes     UIImpactLevel = "yes"
	ImpactNo      UIImpactLevel = "no"
	ImpactUnknown UIImpactLevel = "unknown"
)

// UIImpactResult summarizes heuristic detection of UI/UX changes.
type UIImpactResult struct {
	Level   UIImpactLevel
	Reason  string
	Matches []string
}

var uiFileExtensions = map[string]bool{
	".swift":      true,
	".storyboard": true,
	".xib":        true,
	".swiftui":    true,
}

var uiPathKeywords = []string{
	"view",
	"viewcontroller",
	"swiftui",
	"uikit",
	"storyboard",
	"xib",
	"navigation",
	"tabbar",
	"button",
	"tableview",
	"collectionview",
	"gesture",
	"animation",
}

// DetectUIImpact analyzes changed files for UI/UX impact.
func DetectUIImpact(changedFiles []string) UIImpactResult {
	if len(changedFiles) == 0 {
		return UIImpactResult{Level: ImpactUnknown, Reason: "no change list provided"}
	}

	var matches []string
	for _, file := range changedFiles {
		lower := strings.ToLower(file)
		ext := strings.ToLower(filepath.Ext(file))
		if uiFileExtensions[ext] {
			matches = append(matches, file)
			continue
		}
		for _, keyword := range uiPathKeywords {
			if strings.Contains(lower, keyword) {
				matches = append(matches, file)
				break
			}
		}
	}

	if len(matches) == 0 {
		return UIImpactResult{Level: ImpactNo, Reason: "no UI indicators in changed files"}
	}

	return UIImpactResult{
		Level:   ImpactYes,
		Reason:  "UI-related files or paths changed",
		Matches: matches,
	}
}
