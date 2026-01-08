// Package agent contains helpers for adapting Gas Town to different LLM agents.
// It provides a thin abstraction layer so callers can reason about agent-specific
// behaviors (startup warnings, hook provisioning, etc.) without hard-coding
// Claude-specific logic.
package agent

import (
	"time"

	"github.com/steveyegge/gastown/internal/claude"
	"github.com/steveyegge/gastown/internal/config"
	"github.com/steveyegge/gastown/internal/constants"
	"github.com/steveyegge/gastown/internal/tmux"
)

// StartupAdapter describes agent-specific behaviors needed during startup.
// Over time we can extend this to cover additional lifecycle needs
// (e.g., non-interactive execution, custom resume flows).
type StartupAdapter interface {
	// Name returns the agent's configured name (preset or custom).
	Name() string

	// ProcessName returns the primary process name to look for when
	// checking if the agent is running. Defaults to the agent command.
	ProcessName() string

	// StartTimeout returns how long to wait for the agent to start.
	StartTimeout() time.Duration

	// EnsureRoleSettings prepares any per-role configuration needed
	// before launching the agent (e.g., hook settings).
	EnsureRoleSettings(workDir, role string) error

	// AcceptStartupWarnings dismisses any interactive startup dialogs
	// needed for automation (no-op if none are needed).
	AcceptStartupWarnings(t *tmux.Tmux, session string) error
}

type startupAdapter struct {
	name   string
	preset *config.AgentPresetInfo
}

func (a *startupAdapter) Name() string {
	return a.name
}

func (a *startupAdapter) ProcessName() string {
	if a.preset != nil && a.preset.ProcessName != "" {
		return a.preset.ProcessName
	}
	if a.preset != nil && a.preset.Command != "" {
		return a.preset.Command
	}
	return ""
}

func (a *startupAdapter) StartTimeout() time.Duration {
	if a.preset != nil && a.preset.StartupTimeoutSeconds > 0 {
		return time.Duration(a.preset.StartupTimeoutSeconds) * time.Second
	}
	return constants.AgentStartTimeout
}

func (a *startupAdapter) EnsureRoleSettings(workDir, role string) error {
	if a.preset != nil && a.preset.SupportsHooks {
		// Hooks currently use the Claude settings format.
		// This keeps slash commands and SessionStart hooks working
		// even when the runtime agent is swapped out.
		return claude.EnsureSettingsForRole(workDir, role)
	}
	return nil
}

func (a *startupAdapter) AcceptStartupWarnings(t *tmux.Tmux, session string) error {
	if a.preset != nil && a.preset.Name == config.AgentClaude {
		return t.AcceptBypassPermissionsWarning(session)
	}
	return nil
}

// AdapterFor returns the startup adapter for the resolved agent.
// Falls back to a no-op adapter if the resolution is nil.
func AdapterFor(resolved *config.ResolvedAgent) StartupAdapter {
	if resolved == nil {
		return &startupAdapter{name: string(config.AgentClaude)}
	}
	return &startupAdapter{
		name:   resolved.Name,
		preset: resolved.Preset,
	}
}
