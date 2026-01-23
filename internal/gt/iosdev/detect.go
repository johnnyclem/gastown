package iosdev

import (
	"errors"
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"
)

// IndicatorMatch captures an iOS repository indicator and why it matched.
type IndicatorMatch struct {
	Path   string
	Reason string
}

// DetectionResult contains the outcome of iOS project detection.
type DetectionResult struct {
	IsIOSProject bool
	Matches      []IndicatorMatch
}

// DetectionOptions controls how deep detection walks the filesystem.
type DetectionOptions struct {
	MaxDepth int
}

// DefaultDetectionOptions returns the default detection options.
func DefaultDetectionOptions() DetectionOptions {
	return DetectionOptions{MaxDepth: 4}
}

// DetectProject scans the repo for iOS-specific indicators.
func DetectProject(root string, opts DetectionOptions) (DetectionResult, error) {
	if root == "" {
		return DetectionResult{}, errors.New("root path is required")
	}
	if opts.MaxDepth <= 0 {
		opts.MaxDepth = DefaultDetectionOptions().MaxDepth
	}

	var matches []IndicatorMatch
	root = filepath.Clean(root)
	rootDepth := pathDepth(root)

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			if pathDepth(path)-rootDepth > opts.MaxDepth {
				return fs.SkipDir
			}
			name := d.Name()
			if strings.HasPrefix(name, ".") && name != "." {
				if name == ".xcodeproj" || name == ".xcworkspace" {
					matches = append(matches, IndicatorMatch{
						Path:   path,
						Reason: fmt.Sprintf("found %s directory", name),
					})
				}
				return fs.SkipDir
			}
			return nil
		}

		name := d.Name()
		if strings.HasSuffix(name, ".xcodeproj") || strings.HasSuffix(name, ".xcworkspace") {
			matches = append(matches, IndicatorMatch{
				Path:   path,
				Reason: fmt.Sprintf("found %s", name),
			})
			return nil
		}

		switch name {
		case "Podfile", "Podfile.lock":
			matches = append(matches, IndicatorMatch{Path: path, Reason: "found CocoaPods manifest"})
		case "Package.swift":
			matches = append(matches, IndicatorMatch{Path: path, Reason: "found Swift Package manifest"})
		case "Info.plist":
			matches = append(matches, IndicatorMatch{Path: path, Reason: "found Info.plist"})
		case "Cartfile", "Cartfile.resolved":
			matches = append(matches, IndicatorMatch{Path: path, Reason: "found Carthage manifest"})
		}

		if strings.HasSuffix(name, ".swift") {
			matches = append(matches, IndicatorMatch{Path: path, Reason: "found Swift source"})
		}

		return nil
	})
	if err != nil {
		return DetectionResult{}, fmt.Errorf("walking project: %w", err)
	}

	return DetectionResult{
		IsIOSProject: len(matches) > 0,
		Matches:      matches,
	}, nil
}

func pathDepth(path string) int {
	clean := filepath.Clean(path)
	if clean == string(filepath.Separator) {
		return 0
	}
	parts := strings.Split(clean, string(filepath.Separator))
	count := 0
	for _, part := range parts {
		if part != "" {
			count++
		}
	}
	return count
}
