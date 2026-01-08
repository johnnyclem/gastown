package web

import "strings"

// TownState represents the high-level state needed for the future visual dashboard.
// It is derived from ConvoyData (ConvoyRow, MergeQueueRow, and PolecatRow) which
// currently powers the HTML dashboard.
type TownState struct {
	Agents []AgentState
	Jobs   []JobState
}

// AgentState represents an agent in the town map.
type AgentState struct {
	Name   string
	Role   string
	Status AgentStatus
}

// JobState represents a unit of work tied to a convoy or tracked issue.
type JobState struct {
	ID     string
	Title  string
	Status JobStatus
}

// AgentStatus describes the coarse state of an agent.
type AgentStatus string

const (
	AgentStatusIdle      AgentStatus = "IDLE"
	AgentStatusWorking   AgentStatus = "WORKING"
	AgentStatusMerging   AgentStatus = "MERGING"
	AgentStatusReviewing AgentStatus = "REVIEWING"
	AgentStatusUnknown   AgentStatus = "UNKNOWN"
)

// JobStatus describes the lifecycle of a job for animation mapping.
type JobStatus string

const (
	JobStatusPending    JobStatus = "PENDING"
	JobStatusInProgress JobStatus = "IN_PROGRESS"
	JobStatusMerging    JobStatus = "MERGING"
	JobStatusReviewing  JobStatus = "REVIEWING"
	JobStatusComplete   JobStatus = "COMPLETE"
	JobStatusUnknown    JobStatus = "UNKNOWN"
)

// AnimationState represents the visualization behavior for a job.
type AnimationState string

const (
	AnimationIdle      AnimationState = "IDLE"
	AnimationPhoneCall AnimationState = "PHONE_CALL"
	AnimationWorking   AnimationState = "WORKING"
	AnimationDriving   AnimationState = "DRIVING"
	AnimationReviewing AnimationState = "REVIEWING"
)

// JobStatusFromIssueStatus maps beads issue statuses to JobStatus.
func JobStatusFromIssueStatus(status string) JobStatus {
	switch strings.ToLower(status) {
	case "open", "pending":
		return JobStatusPending
	case "in_progress":
		return JobStatusInProgress
	case "review", "reviewing":
		return JobStatusReviewing
	case "merging", "merge":
		return JobStatusMerging
	case "closed", "done", "complete":
		return JobStatusComplete
	default:
		return JobStatusUnknown
	}
}

// AnimationStateForJobStatus maps a JobStatus into an animation cue.
func AnimationStateForJobStatus(status JobStatus) AnimationState {
	switch status {
	case JobStatusPending:
		return AnimationPhoneCall
	case JobStatusInProgress:
		return AnimationWorking
	case JobStatusMerging:
		return AnimationDriving
	case JobStatusReviewing:
		return AnimationReviewing
	case JobStatusComplete:
		return AnimationIdle
	default:
		return AnimationIdle
	}
}
