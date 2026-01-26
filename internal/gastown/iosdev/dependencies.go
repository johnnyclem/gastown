package iosdev

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// DependencyManager installs iOS project dependencies.
type DependencyManager struct {
	WorkDir string
}

// InstallResult captures dependency install output.
type InstallResult struct {
	Command string
	Stdout  string
	Stderr  string
}

// InstallDependencies installs CocoaPods and resolves Swift Package dependencies when available.
func (m DependencyManager) InstallDependencies(ctx context.Context, opts BuildOptions) ([]InstallResult, error) {
	var results []InstallResult

	podfilePath := filepath.Join(m.WorkDir, "Podfile")
	if _, err := os.Stat(podfilePath); err == nil {
		cmd, args := podInstallCommand(m.WorkDir)
		result, err := runCommand(ctx, m.WorkDir, cmd, args...)
		results = append(results, result)
		if err != nil {
			return results, fmt.Errorf("cocoapods install failed: %w", err)
		}
	}

	// Resolve Swift Package dependencies via xcodebuild when a workspace or project is provided.
	if opts.Workspace != "" || opts.Project != "" {
		xcode := Xcodebuild{WorkDir: m.WorkDir}
		result, err := xcode.ResolvePackageDependencies(ctx, opts)
		results = append(results, InstallResult{
			Command: result.Command,
			Stdout:  result.Stdout,
			Stderr:  result.Stderr,
		})
		if err != nil {
			return results, fmt.Errorf("swift package resolution failed: %w", err)
		}
	}

	return results, nil
}

func podInstallCommand(workDir string) (string, []string) {
	gemfile := filepath.Join(workDir, "Gemfile")
	if _, err := os.Stat(gemfile); err == nil {
		return "bundle", []string{"exec", "pod", "install"}
	}
	return "pod", []string{"install"}
}

func runCommand(ctx context.Context, workDir, name string, args ...string) (InstallResult, error) {
	cmd := exec.CommandContext(ctx, name, args...) //nolint:gosec // G204: args are constructed internally
	cmd.Dir = workDir
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return InstallResult{
			Command: fmt.Sprintf("%s %s", name, strings.Join(args, " ")),
			Stdout:  stdout.String(),
			Stderr:  stderr.String(),
		}, err
	}
	return InstallResult{
		Command: fmt.Sprintf("%s %s", name, strings.Join(args, " ")),
		Stdout:  stdout.String(),
		Stderr:  stderr.String(),
	}, nil
}
