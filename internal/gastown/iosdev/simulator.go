package iosdev

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"strings"
)

// SimulatorSpec describes the desired simulator configuration.
type SimulatorSpec struct {
	Device  string
	Runtime string
}

// SimulatorDevice describes a discovered simulator.
type SimulatorDevice struct {
	Name     string
	UDID     string
	Runtime  string
	State    string
	IsBooted bool
}

// SimulatorController abstracts simulator tooling (idb or simctl).
type SimulatorController interface {
	Name() string
	EnsureBooted(ctx context.Context, spec SimulatorSpec) (SimulatorDevice, error)
	InstallApp(ctx context.Context, udid, appPath string) error
	LaunchApp(ctx context.Context, udid, bundleID string, args []string) error
	Screenshot(ctx context.Context, udid, outputPath string) error
}

// PreferredController returns the best available simulator controller.
func PreferredController() SimulatorController {
	if _, err := exec.LookPath("idb"); err == nil {
		// idb offers robust simulator interaction when available.
		return &IDBController{}
	}
	return &SimctlController{}
}

// SimctlController uses xcrun simctl for simulator management.
type SimctlController struct{}

// Name returns the controller name.
func (s *SimctlController) Name() string { return "simctl" }

// EnsureBooted boots the best matching simulator.
func (s *SimctlController) EnsureBooted(ctx context.Context, spec SimulatorSpec) (SimulatorDevice, error) {
	device, err := s.findDevice(ctx, spec)
	if err != nil {
		return SimulatorDevice{}, err
	}
	if device.IsBooted {
		return device, nil
	}

	if _, err := runSimctl(ctx, "boot", device.UDID); err != nil {
		return SimulatorDevice{}, fmt.Errorf("boot simulator: %w", err)
	}
	device.IsBooted = true
	device.State = "Booted"
	return device, nil
}

// InstallApp installs an app onto the simulator.
func (s *SimctlController) InstallApp(ctx context.Context, udid, appPath string) error {
	_, err := runSimctl(ctx, "install", udid, appPath)
	if err != nil {
		return fmt.Errorf("install app: %w", err)
	}
	return nil
}

// LaunchApp launches the app on the simulator.
func (s *SimctlController) LaunchApp(ctx context.Context, udid, bundleID string, args []string) error {
	cmdArgs := append([]string{"launch", udid, bundleID}, args...)
	_, err := runSimctl(ctx, cmdArgs...)
	if err != nil {
		return fmt.Errorf("launch app: %w", err)
	}
	return nil
}

// Screenshot captures a screenshot from the simulator.
func (s *SimctlController) Screenshot(ctx context.Context, udid, outputPath string) error {
	_, err := runSimctl(ctx, "io", udid, "screenshot", outputPath)
	if err != nil {
		return fmt.Errorf("capture screenshot: %w", err)
	}
	return nil
}

func (s *SimctlController) findDevice(ctx context.Context, spec SimulatorSpec) (SimulatorDevice, error) {
	stdout, err := runSimctl(ctx, "list", "-j", "devices")
	if err != nil {
		return SimulatorDevice{}, fmt.Errorf("list devices: %w", err)
	}

	var data struct {
		Devices map[string][]struct {
			Name     string `json:"name"`
			UDID     string `json:"udid"`
			State    string `json:"state"`
			IsBooted bool   `json:"isBooted"`
		} `json:"devices"`
	}
	if err := json.Unmarshal([]byte(stdout), &data); err != nil {
		return SimulatorDevice{}, fmt.Errorf("parse simctl output: %w", err)
	}

	for runtime, devices := range data.Devices {
		if spec.Runtime != "" && !strings.Contains(runtime, spec.Runtime) {
			continue
		}
		for _, device := range devices {
			if spec.Device != "" && device.Name != spec.Device {
				continue
			}
			return SimulatorDevice{
				Name:     device.Name,
				UDID:     device.UDID,
				Runtime:  runtime,
				State:    device.State,
				IsBooted: device.State == "Booted" || device.IsBooted,
			}, nil
		}
	}

	return SimulatorDevice{}, errors.New("no matching simulator found")
}

func runSimctl(ctx context.Context, args ...string) (string, error) {
	cmdArgs := append([]string{"simctl"}, args...)
	cmd := exec.CommandContext(ctx, "xcrun", cmdArgs...) //nolint:gosec // G204: args are constructed internally
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("xcrun %s: %w (stderr: %s)", strings.Join(cmdArgs, " "), err, strings.TrimSpace(stderr.String()))
	}
	return stdout.String(), nil
}

// IDBController uses Facebook's idb for simulator management.
type IDBController struct{}

// Name returns the controller name.
func (i *IDBController) Name() string { return "idb" }

// EnsureBooted boots or reuses a simulator via idb.
func (i *IDBController) EnsureBooted(ctx context.Context, spec SimulatorSpec) (SimulatorDevice, error) {
	device, err := i.findDevice(ctx, spec)
	if err != nil {
		return SimulatorDevice{}, err
	}
	if device.IsBooted {
		return device, nil
	}

	if _, err := runIDB(ctx, "boot", device.UDID); err != nil {
		return SimulatorDevice{}, fmt.Errorf("boot simulator: %w", err)
	}
	device.IsBooted = true
	device.State = "Booted"
	return device, nil
}

// InstallApp installs an app onto the simulator via idb.
func (i *IDBController) InstallApp(ctx context.Context, udid, appPath string) error {
	_, err := runIDB(ctx, "install", "--udid", udid, appPath)
	if err != nil {
		return fmt.Errorf("install app: %w", err)
	}
	return nil
}

// LaunchApp launches the app via idb.
func (i *IDBController) LaunchApp(ctx context.Context, udid, bundleID string, args []string) error {
	cmdArgs := []string{"launch", "--udid", udid, bundleID}
	cmdArgs = append(cmdArgs, args...)
	_, err := runIDB(ctx, cmdArgs...)
	if err != nil {
		return fmt.Errorf("launch app: %w", err)
	}
	return nil
}

// Screenshot captures a screenshot via idb.
func (i *IDBController) Screenshot(ctx context.Context, udid, outputPath string) error {
	_, err := runIDB(ctx, "screenshot", "--udid", udid, outputPath)
	if err != nil {
		return fmt.Errorf("capture screenshot: %w", err)
	}
	return nil
}

func (i *IDBController) findDevice(ctx context.Context, spec SimulatorSpec) (SimulatorDevice, error) {
	stdout, err := runIDB(ctx, "list-targets", "--json")
	if err != nil {
		return SimulatorDevice{}, fmt.Errorf("list idb targets: %w", err)
	}

	var devices []struct {
		Name     string `json:"name"`
		UDID     string `json:"udid"`
		State    string `json:"state"`
		Runtime  string `json:"os_version"`
		IsBooted bool   `json:"booted"`
	}
	if err := json.Unmarshal([]byte(stdout), &devices); err != nil {
		return SimulatorDevice{}, fmt.Errorf("parse idb output: %w", err)
	}

	for _, device := range devices {
		if spec.Device != "" && device.Name != spec.Device {
			continue
		}
		if spec.Runtime != "" && !strings.Contains(device.Runtime, spec.Runtime) {
			continue
		}
		return SimulatorDevice{
			Name:     device.Name,
			UDID:     device.UDID,
			Runtime:  device.Runtime,
			State:    device.State,
			IsBooted: device.IsBooted,
		}, nil
	}

	return SimulatorDevice{}, errors.New("no matching simulator found")
}

func runIDB(ctx context.Context, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "idb", args...) //nolint:gosec // G204: args are constructed internally
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("idb %s: %w (stderr: %s)", strings.Join(args, " "), err, strings.TrimSpace(stderr.String()))
	}
	return stdout.String(), nil
}

// DefaultSimulatorSpecs returns the default simulator coverage set.
func DefaultSimulatorSpecs() []SimulatorSpec {
	return []SimulatorSpec{
		{Device: "iPhone SE (3rd generation)"},
		{Device: "iPhone 14"},
		{Device: "iPad Pro (12.9-inch) (6th generation)"},
	}
}
