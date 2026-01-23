package cmd

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/steveyegge/gastown/internal/config"
	"github.com/steveyegge/gastown/internal/gt/iosdev"
	"github.com/steveyegge/gastown/internal/style"
)

var (
	iosRoot         string
	iosModeEnable   bool
	iosModeDisable  bool
	iosModeAuto     bool
	iosModeNoAuto   bool
	iosModeRig      string
	iosModeShotsDir string
)

var iosCmd = &cobra.Command{
	Use:     "ios",
	GroupID: GroupWork,
	Short:   "Gas Town iOS Dev mode tools",
	RunE:    requireSubcommand,
}

var iosDetectCmd = &cobra.Command{
	Use:   "detect",
	Short: "Detect whether the current repo is an iOS project",
	RunE: func(cmd *cobra.Command, args []string) error {
		root, err := resolveIOSRoot()
		if err != nil {
			return err
		}

		result, err := iosdev.DetectProject(root, iosdev.DefaultDetectionOptions())
		if err != nil {
			return err
		}

		if result.IsIOSProject {
			fmt.Printf("%s iOS project detected\n", style.Bold.Render("✓"))
		} else {
			fmt.Printf("%s No iOS indicators found\n", style.Dim.Render("○"))
		}

		for _, match := range result.Matches {
			fmt.Printf("  - %s (%s)\n", match.Path, match.Reason)
		}
		return nil
	},
}

var iosModeCmd = &cobra.Command{
	Use:   "mode",
	Short: "Configure iOS Dev mode for the current rig",
	RunE: func(cmd *cobra.Command, args []string) error {
		if iosModeEnable && iosModeDisable {
			return errors.New("cannot use --enable and --disable together")
		}
		if iosModeAuto && iosModeNoAuto {
			return errors.New("cannot use --auto and --no-auto together")
		}

		settings, settingsPath, err := loadRigSettingsForIOS(iosModeRig)
		if err != nil {
			return err
		}
		if settings.IOSDevMode == nil {
			settings.IOSDevMode = &config.IOSDevModeConfig{}
		}

		if iosModeEnable || iosModeDisable {
			value := iosModeEnable
			settings.IOSDevMode.Enabled = &value
		}
		if iosModeAuto || iosModeNoAuto {
			value := iosModeAuto
			settings.IOSDevMode.AutoDetect = &value
		}
		if iosModeShotsDir != "" {
			settings.IOSDevMode.Screenshots = iosModeShotsDir
		}

		if iosModeEnable || iosModeDisable || iosModeAuto || iosModeNoAuto || iosModeShotsDir != "" {
			if err := config.SaveRigSettings(settingsPath, settings); err != nil {
				return fmt.Errorf("saving rig settings: %w", err)
			}
			fmt.Printf("%s Updated iOS Dev mode settings at %s\n", style.Bold.Render("✓"), settingsPath)
		}

		reportIOSModeSettings(settings)
		return nil
	},
}

var iosBuildCmd = &cobra.Command{
	Use:   "build",
	Short: "Build an iOS project via xcodebuild",
	RunE: func(cmd *cobra.Command, args []string) error {
		root, err := resolveIOSRoot()
		if err != nil {
			return err
		}

		opts := readBuildOptions(cmd)
		ctx, cancel := context.WithTimeout(cmd.Context(), 60*time.Minute)
		defer cancel()

		if installDeps, _ := cmd.Flags().GetBool("install-deps"); installDeps {
			manager := iosdev.DependencyManager{WorkDir: root}
			if _, err := manager.InstallDependencies(ctx, opts); err != nil {
				return err
			}
		}

		xcode := iosdev.Xcodebuild{WorkDir: root}
		result, err := xcode.Build(ctx, opts)
		fmt.Print(result.Stdout)
		if err != nil {
			fmt.Fprintln(os.Stderr, result.Stderr)
			return err
		}
		return nil
	},
}

var iosTestCmd = &cobra.Command{
	Use:   "test",
	Short: "Run XCTest or SwiftUI tests via xcodebuild",
	RunE: func(cmd *cobra.Command, args []string) error {
		root, err := resolveIOSRoot()
		if err != nil {
			return err
		}
		opts := iosdev.TestOptions{BuildOptions: readBuildOptions(cmd)}
		testPlan, _ := cmd.Flags().GetString("test-plan")
		onlyTesting, _ := cmd.Flags().GetStringArray("only-testing")
		skipTesting, _ := cmd.Flags().GetStringArray("skip-testing")
		opts.TestPlan = testPlan
		opts.OnlyTesting = onlyTesting
		opts.SkipTesting = skipTesting

		xcode := iosdev.Xcodebuild{WorkDir: root}
		runner := iosdev.TestRunner{Xcodebuild: xcode, Options: opts}
		ctx, cancel := context.WithTimeout(cmd.Context(), 90*time.Minute)
		defer cancel()
		result, err := runner.Run(ctx, iosdev.PhaseAfter)
		fmt.Print(result.Stdout)
		if err != nil {
			fmt.Fprintln(os.Stderr, result.Stderr)
			return err
		}
		return nil
	},
}

var iosScreenshotsCmd = &cobra.Command{
	Use:   "screenshots",
	Short: "Capture iOS simulator screenshots",
	RunE: func(cmd *cobra.Command, args []string) error {
		root, err := resolveIOSRoot()
		if err != nil {
			return err
		}
		bundleID, _ := cmd.Flags().GetString("bundle-id")
		appPath, _ := cmd.Flags().GetString("app-path")
		label, _ := cmd.Flags().GetString("label")
		devices, _ := cmd.Flags().GetStringArray("device")
		runtime, _ := cmd.Flags().GetString("runtime")

		var specs []iosdev.SimulatorSpec
		for _, device := range devices {
			specs = append(specs, iosdev.SimulatorSpec{Device: device, Runtime: runtime})
		}

		workflow := iosdev.ScreenshotWorkflow{
			ScreenshotsDir: filepath.Join(root, "screenshots", "ios"),
			Devices:        specs,
		}

		ctx, cancel := context.WithTimeout(cmd.Context(), 30*time.Minute)
		defer cancel()
		shots, err := workflow.CaptureScreenshots(ctx, label, bundleID, appPath)
		if err != nil {
			return err
		}
		fmt.Printf("%s Captured %d screenshots\n", style.Bold.Render("✓"), len(shots))
		for _, shot := range shots {
			fmt.Printf("  - %s (%s)\n", shot.Path, shot.Device.Name)
		}
		return nil
	},
}

var iosUIImpactCmd = &cobra.Command{
	Use:   "ui-impact",
	Short: "Detect UI/UX impact based on changed files",
	RunE: func(cmd *cobra.Command, args []string) error {
		root, err := resolveIOSRoot()
		if err != nil {
			return err
		}
		files, _ := cmd.Flags().GetStringArray("file")
		useGit, _ := cmd.Flags().GetBool("git")
		if useGit {
			files, err = iosdev.ChangedFilesFromGit(root)
			if err != nil {
				return err
			}
		}

		result := iosdev.DetectUIImpact(files)
		fmt.Printf("UI impact: %s (%s)\n", result.Level, result.Reason)
		for _, match := range result.Matches {
			fmt.Printf("  - %s\n", match)
		}
		if result.Level == iosdev.ImpactUnknown {
			fmt.Println("If unsure, ask the user to confirm UI impact.")
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(iosCmd)
	iosCmd.AddCommand(iosDetectCmd)
	iosCmd.AddCommand(iosModeCmd)
	iosCmd.AddCommand(iosBuildCmd)
	iosCmd.AddCommand(iosTestCmd)
	iosCmd.AddCommand(iosScreenshotsCmd)
	iosCmd.AddCommand(iosUIImpactCmd)

	iosCmd.PersistentFlags().StringVar(&iosRoot, "root", "", "Project root (defaults to git root)")

	iosModeCmd.Flags().BoolVar(&iosModeEnable, "enable", false, "Enable iOS Dev mode for this rig")
	iosModeCmd.Flags().BoolVar(&iosModeDisable, "disable", false, "Disable iOS Dev mode for this rig")
	iosModeCmd.Flags().BoolVar(&iosModeAuto, "auto", false, "Enable auto-detection for iOS Dev mode")
	iosModeCmd.Flags().BoolVar(&iosModeNoAuto, "no-auto", false, "Disable auto-detection for iOS Dev mode")
	iosModeCmd.Flags().StringVar(&iosModeRig, "rig", "", "Rig name (defaults to current rig)")
	iosModeCmd.Flags().StringVar(&iosModeShotsDir, "screenshots-dir", "", "Override screenshots directory")

	registerBuildFlags(iosBuildCmd)
	iosBuildCmd.Flags().Bool("install-deps", true, "Install CocoaPods/Swift packages before building")

	registerBuildFlags(iosTestCmd)
	iosTestCmd.Flags().String("test-plan", "", "Xcode test plan name")
	iosTestCmd.Flags().StringArray("only-testing", nil, "Only run specific tests (repeatable)")
	iosTestCmd.Flags().StringArray("skip-testing", nil, "Skip specific tests (repeatable)")

	iosScreenshotsCmd.Flags().String("bundle-id", "", "Bundle identifier to launch")
	iosScreenshotsCmd.Flags().String("app-path", "", "Path to .app bundle to install")
	iosScreenshotsCmd.Flags().String("label", "before", "Label for screenshots")
	iosScreenshotsCmd.Flags().StringArray("device", nil, "Simulator device name (repeatable)")
	iosScreenshotsCmd.Flags().String("runtime", "", "Simulator runtime filter (e.g., iOS 17.2)")

	iosUIImpactCmd.Flags().StringArray("file", nil, "Changed files to analyze")
	iosUIImpactCmd.Flags().Bool("git", true, "Use git diff to find changed files")
}

func resolveIOSRoot() (string, error) {
	if iosRoot != "" {
		return iosRoot, nil
	}
	root, err := getGitRoot()
	if err != nil || root == "" {
		return "", errors.New("unable to determine git root; use --root")
	}
	return root, nil
}

func readBuildOptions(cmd *cobra.Command) iosdev.BuildOptions {
	workspace, _ := cmd.Flags().GetString("workspace")
	project, _ := cmd.Flags().GetString("project")
	scheme, _ := cmd.Flags().GetString("scheme")
	configuration, _ := cmd.Flags().GetString("configuration")
	sdk, _ := cmd.Flags().GetString("sdk")
	destination, _ := cmd.Flags().GetString("destination")
	derivedData, _ := cmd.Flags().GetString("derived-data")
	additionalArgs, _ := cmd.Flags().GetStringArray("xcodebuild-arg")

	return iosdev.BuildOptions{
		Workspace:       workspace,
		Project:         project,
		Scheme:          scheme,
		Configuration:   configuration,
		SDK:             sdk,
		Destination:     destination,
		DerivedDataPath: derivedData,
		AdditionalArgs:  additionalArgs,
	}
}

func registerBuildFlags(cmd *cobra.Command) {
	cmd.Flags().String("workspace", "", "Xcode workspace path")
	cmd.Flags().String("project", "", "Xcode project path")
	cmd.Flags().String("scheme", "", "Xcode scheme name")
	cmd.Flags().String("configuration", "", "Build configuration (e.g., Debug)")
	cmd.Flags().String("sdk", "", "SDK to use (e.g., iphonesimulator)")
	cmd.Flags().String("destination", "", "Destination spec for xcodebuild")
	cmd.Flags().String("derived-data", "", "Derived data path")
	cmd.Flags().StringArray("xcodebuild-arg", nil, "Additional xcodebuild args (repeatable)")
}

func loadRigSettingsForIOS(rigName string) (*config.RigSettings, string, error) {
	roleInfo, err := GetRole()
	if err != nil {
		return nil, "", err
	}

	rig := rigName
	if rig == "" {
		rig = roleInfo.Rig
	}
	if rig == "" {
		return nil, "", errors.New("rig name required to configure iOS Dev mode")
	}

	rigPath := filepath.Join(roleInfo.TownRoot, rig)
	settingsPath := config.RigSettingsPath(rigPath)
	settings, err := config.LoadRigSettings(settingsPath)
	if err != nil {
		if errors.Is(err, config.ErrNotFound) {
			settings = config.NewRigSettings()
		} else {
			return nil, "", err
		}
	}

	return settings, settingsPath, nil
}

func reportIOSModeSettings(settings *config.RigSettings) {
	mode := settings.IOSDevMode
	if mode == nil {
		fmt.Println("iOS Dev mode: default (auto-detect enabled)")
		return
	}

	enabled := "auto"
	if mode.Enabled != nil {
		if *mode.Enabled {
			enabled = "enabled"
		} else {
			enabled = "disabled"
		}
	}
	auto := "default"
	if mode.AutoDetect != nil {
		if *mode.AutoDetect {
			auto = "enabled"
		} else {
			auto = "disabled"
		}
	}

	fmt.Printf("iOS Dev mode: %s (auto-detect %s)\n", enabled, auto)
	if strings.TrimSpace(mode.Screenshots) != "" {
		fmt.Printf("Screenshots dir: %s\n", mode.Screenshots)
	}
}
