// Gastown Command Center - Domain Types
// Real-time AI Agent Orchestration Platform

// ==================== ROLES & PERMISSIONS ====================

export type UserRole = 'viewer' | 'operator' | 'mayor' | 'service_account';

export interface PermissionMatrix {
  viewer: {
    read: ['town_map', 'evidence_panels', 'replay_views'];
    write: never[];
  };
  operator: {
    read: ['town_map', 'building_interiors', 'battle_terminals'];
    write: ['scoped_commands'];
  };
  mayor: {
    read: ['all_screens'];
    write: ['global_policy', 'incidents', 'cross_project_approvals', 'dangerous_actions'];
  };
  service_account: {
    read: never[];
    write: ['api_automation'];
  };
}

// ==================== ENTITY STATUS TYPES ====================

export type ProjectStatus = 'idle' | 'working' | 'blocked' | 'error' | 'awaiting_approval';
export type AgentStatus = 'idle' | 'working' | 'blocked' | 'error';
export type BeadStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type WorktreeStatus = 'active' | 'archived';
export type MergeLaneStatus = 'green' | 'yellow' | 'red';
export type CheckRunStatus = 'pending' | 'in_progress' | 'completed';
export type CheckRunConclusion = 'success' | 'failure' | 'cancelled' | 'skipped';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'active' | 'investigating' | 'resolved' | 'closed';
export type PullRequestStatus = 'open' | 'merged' | 'closed';
export type ArtifactType = 'diff' | 'ci_log' | 'runtime_log' | 'agent_tool_output' | 'policy_decision';

// ==================== METAPHOR MAPPING ====================

export interface MetaphorMap {
  mayor: 'Tenant admin and governance';
  city_hall: 'Governance control plane';
  crew: 'Human operator group';
  sentry: 'Audit recorder and policy checker';
  building: 'Project';
  bead: 'Task or unit of agent work';
  quest: 'Task or unit of agent work';
  artifact: 'Immutable evidence object';
  room: 'Branch/worktree workspace';
  worktree: 'Branch/worktree workspace';
  package: 'Commit';
  truck: 'Push/PR movement';
  highway_lane: 'Merge queue lane';
  toll_booth: 'CI check run';
  gate: 'CI check run and policy gate';
  conflict_encounter: 'Merge conflict workflow';
}

// ==================== CORE ENTITIES ====================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  statusReason: string | null;
  repoProvider: string | null;
  repoId: string | null;
  lastImportantEventAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  worktrees?: Worktree[];
  beads?: Bead[];
  agents?: Agent[];
  mergeLanes?: MergeLane[];
  incidents?: Incident[];
}

export interface Agent {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  type: 'worker' | 'reviewer' | 'orchestrator';
  status: AgentStatus;
  statusReason: string | null;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  beads?: Bead[];
}

export interface Worktree {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  branchName: string;
  headSha: string | null;
  baseSha: string | null;
  status: WorktreeStatus;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  commits?: Commit[];
}

export interface Bead {
  id: string;
  tenantId: string;
  projectId: string;
  agentId: string | null;
  title: string;
  description: string | null;
  status: BeadStatus;
  statusReason: string | null;
  priority: number;
  requiredArtifacts: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  artifacts?: Artifact[];
}

// ==================== GIT ENTITIES ====================

export interface Commit {
  id: string;
  tenantId: string;
  worktreeId: string;
  sha: string;
  message: string;
  author: string | null;
  authorEmail: string | null;
  parentSha: string | null;
  createdAt: Date;
}

export interface Push {
  id: string;
  tenantId: string;
  projectId: string;
  commitId: string | null;
  branchName: string;
  pushId: string;
  provider: string | null;
  createdAt: Date;
  // Relations
  pullRequest?: PullRequest;
}

export interface PullRequest {
  id: string;
  tenantId: string;
  projectId: string;
  pushId: string;
  prNumber: number;
  title: string;
  status: PullRequestStatus;
  sourceBranch: string;
  targetBranch: string;
  mergeable: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  checkRuns?: CheckRun[];
}

export interface MergeLane {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  status: MergeLaneStatus;
  queuePosition: number;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  checkRuns?: CheckRun[];
}

export interface CheckRun {
  id: string;
  tenantId: string;
  pullRequestId: string | null;
  mergeLaneId: string | null;
  name: string;
  status: CheckRunStatus;
  conclusion: CheckRunConclusion | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

// ==================== ARTIFACTS & EVIDENCE ====================

export interface Artifact {
  id: string;
  tenantId: string;
  beadId: string | null;
  type: ArtifactType;
  name: string;
  content: string | null;
  contentUrl: string | null;
  sha256: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// ==================== GOVERNANCE ====================

export interface Policy {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  version: number;
  rules: Record<string, unknown>;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  tenantId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  scope: Record<string, unknown> | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== AUDIT ====================

export interface AuditLedgerEntry {
  id: string;
  tenantId: string;
  userId: string | null;
  actorId: string | null;
  actorRole: string | null;
  scope: Record<string, unknown> | null;
  commandIntent: string;
  commandType: string | null;
  entityType: string | null;
  entityId: string | null;
  policyVersion: string | null;
  evidenceRefs: string[] | null;
  missingEvidence: string[] | null;
  correlationId: string | null;
  causationId: string | null;
  eventPayload: Record<string, unknown> | null;
  occurredAt: Date;
  recordedAt: Date;
}

// ==================== EVENTS ====================

export interface Event {
  id: string;
  tenantId: string;
  eventId: string;
  eventType: string;
  eventVersion: number;
  actor: Record<string, unknown> | null;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown>;
  evidenceRefs: string[] | null;
  correlationId: string | null;
  causationId: string | null;
  occurredAt: Date;
  recordedAt: Date;
}

// ==================== UI PROJECTION TYPES ====================

export interface ProjectCard {
  id: string;
  name: string;
  status: ProjectStatus;
  statusReason: string | null;
  lastImportantEventAt: Date | null;
  agentCount: number;
  beadCount: number;
  pendingApprovals: number;
  failingChecks: number;
  topBlockers: Blocker[];
  evidenceLinks: EvidenceLink[];
}

export interface Blocker {
  id: string;
  type: 'check_failure' | 'conflict' | 'missing_approval' | 'policy_violation' | 'agent_error';
  message: string;
  entityId: string;
  entityType: string;
}

export interface EvidenceLink {
  id: string;
  type: ArtifactType;
  name: string;
  url: string;
}

export interface TownMapMetrics {
  totalProjects: number;
  blockedProjects: number;
  pendingApprovals: number;
  mergeQueueHealth: number;
  activeIncidents: number;
  activeAgents: number;
}

export interface BuildingInterior {
  project: Project;
  worktrees: Worktree[];
  agents: Agent[];
  beads: Bead[];
  recentArtifacts: Artifact[];
  mergeLanes: MergeLane[];
  recentEvents: Event[];
}

export interface BattleTerminalState {
  agent: Agent;
  currentBead: Bead | null;
  options: TerminalOption[];
  toolCalls: ToolCall[];
  meters: AgentMeters;
}

export interface TerminalOption {
  id: string;
  label: string;
  action: string;
  type: 'inspection' | 'mutation';
  prerequisite?: string;
  evidenceRequired?: string[];
}

export interface ToolCall {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
  correlationId: string;
  artifactLinks: EvidenceLink[];
}

export interface AgentMeters {
  progress: number; // completed_beads / total_beads
  tests: number; // passing_checks / required_checks
  risk: number; // policy score
  confidence: number; // evidence completeness
  tokens: number;
  cost: number;
}

// ==================== HIGHWAY TYPES ====================

export interface HighwayLane {
  id: string;
  projectId: string;
  projectName: string;
  status: MergeLaneStatus;
  queuePosition: number;
  trucks: Truck[];
  gates: Gate[];
}

export interface Truck {
  id: string;
  prNumber: number;
  title: string;
  status: 'moving' | 'waiting' | 'blocked';
  position: number;
  driver: string; // Author
  cargo: string[]; // Commit SHAs
}

export interface Gate {
  id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  reasonCode: string;
  checkRuns: CheckRun[];
  evidenceLinks: EvidenceLink[];
}

// ==================== CITY HALL TYPES ====================

export interface CityHallState {
  globalQueue: QueueItem[];
  activePolicies: Policy[];
  activeIncidents: Incident[];
  coordinationIssues: CoordinationIssue[];
  recentAuditEntries: AuditLedgerEntry[];
}

export interface QueueItem {
  id: string;
  type: 'approval' | 'incident' | 'policy_change' | 'cross_project';
  priority: number;
  title: string;
  description: string;
  projectId: string | null;
  projectName: string | null;
  createdAt: Date;
  actor: string;
}

export interface CoordinationIssue {
  id: string;
  type: 'merge_conflict' | 'resource_contention' | 'policy_violation' | 'agent_deadlock';
  heuristic: string;
  evidenceLinks: EvidenceLink[];
  remediationCommands: TerminalOption[];
}

// ==================== WEBSOCKET MESSAGE TYPES ====================

export interface WSEventMessage {
  type: 'event';
  eventType: string;
  tenantId: string;
  entityId: string;
  entityType: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export interface WSSnapshotMessage {
  type: 'snapshot';
  version: number;
  cursorHighwater: string;
  state: Record<string, unknown>;
}

export interface WSReplayMessage {
  type: 'replay';
  events: WSEventMessage[];
  cursorStart: string;
  cursorEnd: string;
}

// ==================== DEEP LINK TYPES ====================

export interface DeepLink {
  tenantId: string;
  resource: 'events' | 'artifacts' | 'projects' | 'agents';
  id: string;
  queryParams?: Record<string, string>;
}

export function parseDeepLink(url: string): DeepLink | null {
  const match = url.match(/\/t\/([^/]+)\/([^/]+)\/([^/?]+)/);
  if (!match) return null;
  return {
    tenantId: match[1],
    resource: match[2] as DeepLink['resource'],
    id: match[3],
  };
}

export function buildDeepLink(link: DeepLink): string {
  let url = `/t/${link.tenantId}/${link.resource}/${link.id}`;
  if (link.queryParams) {
    const params = new URLSearchParams(link.queryParams);
    url += `?${params.toString()}`;
  }
  return url;
}
