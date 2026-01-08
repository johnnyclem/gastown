package web

import (
	"sort"
	"strings"
)

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

// TownStateFromConvoyData maps convoy and polecat data into a TownState snapshot.
func TownStateFromConvoyData(convoys []ConvoyRow, polecats []PolecatRow) TownState {
	agents := make(map[string]AgentState)
	for _, polecat := range polecats {
		role := roleForAgentName(polecat.Name)
		agents[polecat.Name] = AgentState{
			Name:   polecat.Name,
			Role:   role,
			Status: AgentStatusIdle,
		}
	}

	jobs := make([]JobState, 0)
	for _, convoy := range convoys {
		for _, issue := range convoy.TrackedIssues {
			jobStatus := JobStatusFromIssueStatus(issue.Status)
			jobs = append(jobs, JobState{
				ID:     issue.ID,
				Title:  issue.Title,
				Status: jobStatus,
			})

			if issue.Assignee == "" {
				continue
			}

			current := agents[issue.Assignee]
			if current.Name == "" {
				current = AgentState{
					Name: issue.Assignee,
					Role: "polecat",
				}
			}
			current.Status = mergeAgentStatus(current.Status, agentStatusForJobStatus(jobStatus))
			agents[issue.Assignee] = current
		}
	}

	agentList := make([]AgentState, 0, len(agents))
	for _, agent := range agents {
		agentList = append(agentList, agent)
	}
	sort.Slice(agentList, func(i, j int) bool {
		return agentList[i].Name < agentList[j].Name
	})

	sort.Slice(jobs, func(i, j int) bool {
		if jobs[i].ID == jobs[j].ID {
			return jobs[i].Title < jobs[j].Title
		}
		return jobs[i].ID < jobs[j].ID
	})

	return TownState{
		Agents: agentList,
		Jobs:   jobs,
	}
}

func agentStatusForJobStatus(status JobStatus) AgentStatus {
	switch status {
	case JobStatusReviewing:
		return AgentStatusReviewing
	case JobStatusMerging:
		return AgentStatusMerging
	case JobStatusInProgress:
		return AgentStatusWorking
	case JobStatusPending:
		return AgentStatusIdle
	default:
		return AgentStatusUnknown
	}
}

func mergeAgentStatus(current, candidate AgentStatus) AgentStatus {
	if current == "" || current == AgentStatusUnknown {
		return candidate
	}
	if candidate == AgentStatusUnknown {
		return current
	}
	if agentStatusPriority(candidate) > agentStatusPriority(current) {
		return candidate
	}
	return current
}

func agentStatusPriority(status AgentStatus) int {
	switch status {
	case AgentStatusMerging:
		return 4
	case AgentStatusReviewing:
		return 3
	case AgentStatusWorking:
		return 2
	case AgentStatusIdle:
		return 1
	default:
		return 0
	}
}

func roleForAgentName(name string) string {
	switch strings.ToLower(name) {
	case "mayor":
		return "mayor"
	case "deacon":
		return "deacon"
	case "witness":
		return "witness"
	case "refinery":
		return "refinery"
	default:
		return "polecat"
	}
}
