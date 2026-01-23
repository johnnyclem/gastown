package iosdev

import (
	"context"
	"fmt"
	"strings"

	"github.com/steveyegge/gastown/internal/util"
)

// TestPhase indicates whether tests run before or after changes.
type TestPhase string

const (
	PhaseBefore TestPhase = "before"
	PhaseAfter  TestPhase = "after"
)

// TestRunner runs iOS test suites using xcodebuild.
type TestRunner struct {
	Xcodebuild Xcodebuild
	Options    TestOptions
}

// Run executes tests and returns output for reporting.
func (t TestRunner) Run(ctx context.Context, phase TestPhase) (XcodebuildResult, error) {
	result, err := t.Xcodebuild.Test(ctx, t.Options)
	if err != nil {
		return result, fmt.Errorf("xcodebuild test (%s) failed: %w", phase, err)
	}
	return result, nil
}

// ChangedFilesFromGit returns changed files using git diff.
func ChangedFilesFromGit(workDir string) ([]string, error) {
	out, err := util.ExecWithOutput(workDir, "git", "diff", "--name-only")
	if err != nil {
		return nil, fmt.Errorf("git diff failed: %w", err)
	}
	lines := strings.Fields(out)
	return lines, nil
}
