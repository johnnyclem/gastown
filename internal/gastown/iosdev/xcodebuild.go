package iosdev

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"
)

// Xcodebuild wraps invocation of the xcodebuild CLI.
type Xcodebuild struct {
	WorkDir string
	Path    string
}

// XcodebuildResult captures command output.
type XcodebuildResult struct {
	Command string
	Stdout  string
	Stderr  string
}

// BuildOptions configures xcodebuild build/resolve commands.
type BuildOptions struct {
	Workspace       string
	Project         string
	Scheme          string
	Configuration   string
	SDK             string
	Destination     string
	DerivedDataPath string
	AdditionalArgs  []string
}

// TestOptions configures xcodebuild test commands.
type TestOptions struct {
	BuildOptions
	TestPlan    string
	OnlyTesting []string
	SkipTesting []string
}

// ResolvePackageDependencies runs xcodebuild -resolvePackageDependencies.
func (x Xcodebuild) ResolvePackageDependencies(ctx context.Context, opts BuildOptions) (XcodebuildResult, error) {
	args := append(x.baseArgs(opts), "-resolvePackageDependencies")
	return x.run(ctx, args)
}

// Build runs xcodebuild build with the provided options.
func (x Xcodebuild) Build(ctx context.Context, opts BuildOptions) (XcodebuildResult, error) {
	args := append(x.baseArgs(opts), "build")
	return x.run(ctx, args)
}

// Test runs xcodebuild test with the provided options.
func (x Xcodebuild) Test(ctx context.Context, opts TestOptions) (XcodebuildResult, error) {
	args := x.baseArgs(opts.BuildOptions)
	args = append(args, "test")
	if opts.TestPlan != "" {
		args = append(args, "-testPlan", opts.TestPlan)
	}
	for _, test := range opts.OnlyTesting {
		args = append(args, "-only-testing", test)
	}
	for _, test := range opts.SkipTesting {
		args = append(args, "-skip-testing", test)
	}
	return x.run(ctx, args)
}

func (x Xcodebuild) baseArgs(opts BuildOptions) []string {
	args := []string{}
	if opts.Workspace != "" {
		args = append(args, "-workspace", opts.Workspace)
	}
	if opts.Project != "" {
		args = append(args, "-project", opts.Project)
	}
	if opts.Scheme != "" {
		args = append(args, "-scheme", opts.Scheme)
	}
	if opts.Configuration != "" {
		args = append(args, "-configuration", opts.Configuration)
	}
	if opts.SDK != "" {
		args = append(args, "-sdk", opts.SDK)
	}
	if opts.Destination != "" {
		args = append(args, "-destination", opts.Destination)
	}
	if opts.DerivedDataPath != "" {
		args = append(args, "-derivedDataPath", opts.DerivedDataPath)
	}
	args = append(args, opts.AdditionalArgs...)
	return args
}

func (x Xcodebuild) run(ctx context.Context, args []string) (XcodebuildResult, error) {
	path := x.Path
	if path == "" {
		path = "xcodebuild"
	}

	cmd := exec.CommandContext(ctx, path, args...) //nolint:gosec // G204: args are constructed internally
	if x.WorkDir != "" {
		cmd.Dir = x.WorkDir
	}
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return XcodebuildResult{
			Command: fmt.Sprintf("%s %s", path, strings.Join(args, " ")),
			Stdout:  stdout.String(),
			Stderr:  stderr.String(),
		}, fmt.Errorf("xcodebuild failed: %w", err)
	}

	return XcodebuildResult{
		Command: fmt.Sprintf("%s %s", path, strings.Join(args, " ")),
		Stdout:  stdout.String(),
		Stderr:  stderr.String(),
	}, nil
}
