// Gastown Command Center - Mock Data
// Real-time AI Agent Orchestration Platform

import type {
  Project,
  Agent,
  Worktree,
  Bead,
  Artifact,
  MergeLane,
  CheckRun,
  PullRequest,
  Incident,
  Policy,
  Event,
  AuditLedgerEntry,
  User,
  Tenant,
  HighwayLane,
  Truck,
  Gate,
  QueueItem,
  CoordinationIssue,
  ToolCall,
  TerminalOption,
} from '@/types/gastown';

// ==================== TENANT & USER ====================

export const mockTenant: Tenant = {
  id: 'tenant_001',
  name: 'Gastown Digital',
  slug: 'gastown-digital',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUser: User = {
  id: 'user_001',
  tenantId: 'tenant_001',
  email: 'mayor@gastown.digital',
  name: 'Mayor Chen',
  role: 'mayor',
  avatar: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ==================== PROJECTS ====================

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    tenantId: 'tenant_001',
    name: 'Payment Gateway',
    description: 'Secure payment processing microservice',
    status: 'working',
    statusReason: 'Agent processing refund feature',
    repoProvider: 'github',
    repoId: 'gastown/payment-gateway',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 5),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_002',
    tenantId: 'tenant_001',
    name: 'User Auth Service',
    description: 'Authentication and authorization service',
    status: 'blocked',
    statusReason: 'CI check failed: security scan',
    repoProvider: 'github',
    repoId: 'gastown/auth-service',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 15),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_003',
    tenantId: 'tenant_001',
    name: 'Data Pipeline',
    description: 'ETL pipeline for analytics',
    status: 'awaiting_approval',
    statusReason: 'Merge requires human signoff',
    repoProvider: 'github',
    repoId: 'gastown/data-pipeline',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_004',
    tenantId: 'tenant_001',
    name: 'API Gateway',
    description: 'Central API routing and rate limiting',
    status: 'idle',
    statusReason: null,
    repoProvider: 'github',
    repoId: 'gastown/api-gateway',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_005',
    tenantId: 'tenant_001',
    name: 'Notification Hub',
    description: 'Multi-channel notification service',
    status: 'error',
    statusReason: 'Agent encountered runtime error',
    repoProvider: 'github',
    repoId: 'gastown/notification-hub',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 45),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_006',
    tenantId: 'tenant_001',
    name: 'Search Engine',
    description: 'Full-text search and indexing',
    status: 'working',
    statusReason: 'Agent implementing fuzzy search',
    repoProvider: 'github',
    repoId: 'gastown/search-engine',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 10),
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_007',
    tenantId: 'tenant_001',
    name: 'Cache Layer',
    description: 'Distributed caching system',
    status: 'blocked',
    statusReason: 'Merge conflict detected',
    repoProvider: 'github',
    repoId: 'gastown/cache-layer',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 20),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },
  {
    id: 'proj_008',
    tenantId: 'tenant_001',
    name: 'Logging Service',
    description: 'Centralized logging and monitoring',
    status: 'idle',
    statusReason: null,
    repoProvider: 'github',
    repoId: 'gastown/logging-service',
    lastImportantEventAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
  },
];

// ==================== AGENTS ====================

export const mockAgents: Agent[] = [
  // Payment Gateway agents
  {
    id: 'agent_001',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    name: 'RefundBot',
    type: 'worker',
    status: 'working',
    statusReason: 'Processing refund logic',
    lastActiveAt: new Date(Date.now() - 1000 * 30),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'agent_002',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    name: 'CodeReviewer',
    type: 'reviewer',
    status: 'idle',
    statusReason: null,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 10),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  // Auth Service agents
  {
    id: 'agent_003',
    tenantId: 'tenant_001',
    projectId: 'proj_002',
    name: 'SecurityBot',
    type: 'worker',
    status: 'blocked',
    statusReason: 'Waiting for security scan resolution',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 5),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  // Data Pipeline agents
  {
    id: 'agent_004',
    tenantId: 'tenant_001',
    projectId: 'proj_003',
    name: 'PipelineOrchestrator',
    type: 'orchestrator',
    status: 'idle',
    statusReason: null,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  // Notification Hub agents
  {
    id: 'agent_005',
    tenantId: 'tenant_001',
    projectId: 'proj_005',
    name: 'NotifyWorker',
    type: 'worker',
    status: 'error',
    statusReason: 'Runtime error: connection timeout',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 45),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
  },
  // Search Engine agents
  {
    id: 'agent_006',
    tenantId: 'tenant_001',
    projectId: 'proj_006',
    name: 'SearchBot',
    type: 'worker',
    status: 'working',
    statusReason: 'Implementing fuzzy search algorithm',
    lastActiveAt: new Date(Date.now() - 1000 * 10),
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
  },
];

// ==================== WORKTREES ====================

export const mockWorktrees: Worktree[] = [
  {
    id: 'wt_001',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    name: 'Main Office',
    branchName: 'main',
    headSha: 'abc123def456',
    baseSha: 'xyz789uvw012',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'wt_002',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    name: 'Refund Room',
    branchName: 'feature/refund-processing',
    headSha: 'def456ghi789',
    baseSha: 'abc123def456',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  {
    id: 'wt_003',
    tenantId: 'tenant_001',
    projectId: 'proj_002',
    name: 'Security Wing',
    branchName: 'security/oauth-fix',
    headSha: 'jkl012mno345',
    baseSha: 'pqr678stu901',
    status: 'active',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(),
  },
];

// ==================== BEADS (TASKS) ====================

export const mockBeads: Bead[] = [
  {
    id: 'bead_001',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    agentId: 'agent_001',
    title: 'Implement refund logic',
    description: 'Add refund processing for failed transactions',
    status: 'in_progress',
    statusReason: null,
    priority: 1,
    requiredArtifacts: ['artifact_001'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(),
  },
  {
    id: 'bead_002',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    agentId: 'agent_002',
    title: 'Review refund PR',
    description: 'Code review for refund feature',
    status: 'pending',
    statusReason: null,
    priority: 2,
    requiredArtifacts: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    updatedAt: new Date(),
  },
  {
    id: 'bead_003',
    tenantId: 'tenant_001',
    projectId: 'proj_002',
    agentId: 'agent_003',
    title: 'Fix OAuth vulnerability',
    description: 'Address security scan findings',
    status: 'blocked',
    statusReason: 'Waiting for security review',
    priority: 0,
    requiredArtifacts: ['artifact_002'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    updatedAt: new Date(),
  },
  {
    id: 'bead_004',
    tenantId: 'tenant_001',
    projectId: 'proj_006',
    agentId: 'agent_006',
    title: 'Implement fuzzy search',
    description: 'Add Levenshtein distance based fuzzy matching',
    status: 'in_progress',
    statusReason: null,
    priority: 1,
    requiredArtifacts: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(),
  },
];

// ==================== ARTIFACTS ====================

export const mockArtifacts: Artifact[] = [
  {
    id: 'artifact_001',
    tenantId: 'tenant_001',
    beadId: 'bead_001',
    type: 'diff',
    name: 'refund_logic.diff',
    content: '--- a/src/refund.ts\n+++ b/src/refund.ts\n@@ -1,5 +1,10 @@\n+async function processRefund(txId: string) {\n+  // Implementation\n+}',
    contentUrl: null,
    sha256: 'abc123',
    metadata: { linesAdded: 10, linesRemoved: 2 },
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: 'artifact_002',
    tenantId: 'tenant_001',
    beadId: 'bead_003',
    type: 'ci_log',
    name: 'security_scan.log',
    content: '[ERROR] Vulnerability detected in OAuth flow\n[HIGH] Token exposure in redirect URL',
    contentUrl: null,
    sha256: 'def456',
    metadata: { severity: 'high', tool: 'sonarqube' },
    createdAt: new Date(Date.now() - 1000 * 60 * 55),
  },
  {
    id: 'artifact_003',
    tenantId: 'tenant_001',
    beadId: null,
    type: 'agent_tool_output',
    name: 'code_analysis.json',
    content: JSON.stringify({
      complexity: 'medium',
      coverage: 0.85,
      suggestions: ['Add error handling', 'Consider edge cases'],
    }),
    contentUrl: null,
    sha256: 'ghi789',
    metadata: { agentId: 'agent_001', tool: 'analyzer' },
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
];

// ==================== MERGE LANES & CHECK RUNS ====================

export const mockMergeLanes: MergeLane[] = [
  {
    id: 'lane_001',
    tenantId: 'tenant_001',
    projectId: 'proj_001',
    name: 'Payment Gateway Lane',
    status: 'green',
    queuePosition: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'lane_002',
    tenantId: 'tenant_001',
    projectId: 'proj_002',
    name: 'Auth Service Lane',
    status: 'red',
    queuePosition: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  {
    id: 'lane_003',
    tenantId: 'tenant_001',
    projectId: 'proj_003',
    name: 'Data Pipeline Lane',
    status: 'yellow',
    queuePosition: 2,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
];

export const mockCheckRuns: CheckRun[] = [
  {
    id: 'check_001',
    tenantId: 'tenant_001',
    pullRequestId: 'pr_001',
    mergeLaneId: 'lane_001',
    name: 'Unit Tests',
    status: 'completed',
    conclusion: 'success',
    startedAt: new Date(Date.now() - 1000 * 60 * 10),
    completedAt: new Date(Date.now() - 1000 * 60 * 8),
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'check_002',
    tenantId: 'tenant_001',
    pullRequestId: 'pr_001',
    mergeLaneId: 'lane_001',
    name: 'Integration Tests',
    status: 'completed',
    conclusion: 'success',
    startedAt: new Date(Date.now() - 1000 * 60 * 8),
    completedAt: new Date(Date.now() - 1000 * 60 * 5),
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
  },
  {
    id: 'check_003',
    tenantId: 'tenant_001',
    pullRequestId: 'pr_002',
    mergeLaneId: 'lane_002',
    name: 'Security Scan',
    status: 'completed',
    conclusion: 'failure',
    startedAt: new Date(Date.now() - 1000 * 60 * 20),
    completedAt: new Date(Date.now() - 1000 * 60 * 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  },
];

// ==================== INCIDENTS ====================

export const mockIncidents: Incident[] = [
  {
    id: 'inc_001',
    tenantId: 'tenant_001',
    projectId: 'proj_002',
    title: 'Security Vulnerability Detected',
    description: 'OAuth token exposure in auth service',
    severity: 'high',
    status: 'investigating',
    scope: { projectId: 'proj_002', agentId: 'agent_003' },
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    updatedAt: new Date(),
  },
  {
    id: 'inc_002',
    tenantId: 'tenant_001',
    projectId: 'proj_005',
    title: 'Agent Runtime Error',
    description: 'NotifyWorker encountered connection timeout',
    severity: 'medium',
    status: 'active',
    scope: { projectId: 'proj_005', agentId: 'agent_005' },
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(),
  },
];

// ==================== POLICIES ====================

export const mockPolicies: Policy[] = [
  {
    id: 'policy_001',
    tenantId: 'tenant_001',
    name: 'Security Review Policy',
    description: 'All security-related changes require human signoff',
    version: 1,
    rules: {
      requiresSignoff: true,
      signoffRoles: ['mayor', 'operator'],
      conditions: ['security_scan', 'oauth_changes'],
    },
    isActive: true,
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'policy_002',
    tenantId: 'tenant_001',
    name: 'Merge Queue Policy',
    description: 'Defines merge queue eligibility rules',
    version: 2,
    rules: {
      requiredChecks: ['unit_tests', 'integration_tests', 'security_scan'],
      autoMerge: false,
      conflictResolution: 'require_human',
    },
    isActive: true,
    effectiveFrom: new Date('2024-01-15'),
    effectiveTo: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
];

// ==================== EVENTS ====================

export const mockEvents: Event[] = [
  {
    id: 'evt_001',
    tenantId: 'tenant_001',
    eventId: 'evt_001',
    eventType: 'agent.state_changed',
    eventVersion: 1,
    actor: { type: 'agent', id: 'agent_001' },
    entityType: 'agent',
    entityId: 'agent_001',
    payload: { from: 'idle', to: 'working', reason: 'Task assigned' },
    evidenceRefs: null,
    correlationId: 'corr_001',
    causationId: null,
    occurredAt: new Date(Date.now() - 1000 * 60 * 30),
    recordedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'evt_002',
    tenantId: 'tenant_001',
    eventId: 'evt_002',
    eventType: 'check_run.completed',
    eventVersion: 1,
    actor: { type: 'system', id: 'ci_runner' },
    entityType: 'check_run',
    entityId: 'check_003',
    payload: { conclusion: 'failure', duration: 300 },
    evidenceRefs: ['artifact_002'],
    correlationId: 'corr_002',
    causationId: 'corr_001',
    occurredAt: new Date(Date.now() - 1000 * 60 * 15),
    recordedAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'evt_003',
    tenantId: 'tenant_001',
    eventId: 'evt_003',
    eventType: 'incident.declared',
    eventVersion: 1,
    actor: { type: 'user', id: 'user_001', role: 'mayor' },
    entityType: 'incident',
    entityId: 'inc_001',
    payload: { severity: 'high', scope: { projectId: 'proj_002' } },
    evidenceRefs: ['artifact_002'],
    correlationId: 'corr_003',
    causationId: 'corr_002',
    occurredAt: new Date(Date.now() - 1000 * 60 * 45),
    recordedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
];

// ==================== AUDIT LEDGER ====================

export const mockAuditEntries: AuditLedgerEntry[] = [
  {
    id: 'audit_001',
    tenantId: 'tenant_001',
    userId: 'user_001',
    actorId: 'user_001',
    actorRole: 'mayor',
    scope: { projectId: 'proj_002' },
    commandIntent: 'DECLARE_INCIDENT',
    commandType: 'command.incident.declare',
    entityType: 'incident',
    entityId: 'inc_001',
    policyVersion: 'policy_001:v1',
    evidenceRefs: ['artifact_002'],
    missingEvidence: null,
    correlationId: 'corr_003',
    causationId: 'corr_002',
    eventPayload: { severity: 'high', description: 'OAuth vulnerability' },
    occurredAt: new Date(Date.now() - 1000 * 60 * 45),
    recordedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
];

// ==================== HIGHWAY DATA ====================

export const mockHighwayLanes: HighwayLane[] = [
  {
    id: 'hlane_001',
    projectId: 'proj_001',
    projectName: 'Payment Gateway',
    status: 'green',
    queuePosition: 1,
    trucks: [
      {
        id: 'truck_001',
        prNumber: 142,
        title: 'Feature: Refund processing',
        status: 'moving',
        position: 80,
        driver: 'agent_001',
        cargo: ['abc123', 'def456'],
      },
    ],
    gates: [
      {
        id: 'gate_001',
        name: 'Unit Tests',
        status: 'green',
        reasonCode: 'all_passed',
        checkRuns: [mockCheckRuns[0]],
        evidenceLinks: [],
      },
      {
        id: 'gate_002',
        name: 'Integration Tests',
        status: 'green',
        reasonCode: 'all_passed',
        checkRuns: [mockCheckRuns[1]],
        evidenceLinks: [],
      },
    ],
  },
  {
    id: 'hlane_002',
    projectId: 'proj_002',
    projectName: 'User Auth Service',
    status: 'red',
    queuePosition: 1,
    trucks: [
      {
        id: 'truck_002',
        prNumber: 87,
        title: 'Fix: OAuth vulnerability',
        status: 'blocked',
        position: 20,
        driver: 'agent_003',
        cargo: ['jkl012', 'mno345'],
      },
    ],
    gates: [
      {
        id: 'gate_003',
        name: 'Security Scan',
        status: 'red',
        reasonCode: 'vulnerability_detected',
        checkRuns: [mockCheckRuns[2]],
        evidenceLinks: [{ id: 'artifact_002', type: 'ci_log', name: 'security_scan.log', url: '/t/tenant_001/artifacts/artifact_002' }],
      },
    ],
  },
  {
    id: 'hlane_003',
    projectId: 'proj_003',
    projectName: 'Data Pipeline',
    status: 'yellow',
    queuePosition: 2,
    trucks: [
      {
        id: 'truck_003',
        prNumber: 56,
        title: 'Feature: ETL optimization',
        status: 'waiting',
        position: 50,
        driver: 'agent_004',
        cargo: ['pqr678', 'stu901'],
      },
    ],
    gates: [
      {
        id: 'gate_004',
        name: 'Policy Gate',
        status: 'yellow',
        reasonCode: 'awaiting_signoff',
        checkRuns: [],
        evidenceLinks: [],
      },
    ],
  },
];

// ==================== CITY HALL DATA ====================

export const mockCityHallQueue: QueueItem[] = [
  {
    id: 'queue_001',
    type: 'approval',
    priority: 1,
    title: 'Merge Approval Required',
    description: 'Data Pipeline ETL optimization requires human signoff',
    projectId: 'proj_003',
    projectName: 'Data Pipeline',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    actor: 'agent_004',
  },
  {
    id: 'queue_002',
    type: 'incident',
    priority: 0,
    title: 'Security Incident',
    description: 'OAuth vulnerability in auth service',
    projectId: 'proj_002',
    projectName: 'User Auth Service',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    actor: 'user_001',
  },
  {
    id: 'queue_003',
    type: 'cross_project',
    priority: 2,
    title: 'Dependency Conflict',
    description: 'Cache Layer has merge conflict with Payment Gateway changes',
    projectId: 'proj_007',
    projectName: 'Cache Layer',
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    actor: 'system',
  },
];

export const mockCoordinationIssues: CoordinationIssue[] = [
  {
    id: 'coord_001',
    type: 'merge_conflict',
    heuristic: 'Same file modified in concurrent PRs',
    evidenceLinks: [
      { id: 'artifact_001', type: 'diff', name: 'refund_logic.diff', url: '/t/tenant_001/artifacts/artifact_001' },
    ],
    remediationCommands: [
      { id: 'cmd_001', label: 'OPEN_CONFLICT_FILES', action: 'open_conflict', type: 'inspection' },
      { id: 'cmd_002', label: 'ASK_AGENT', action: 'ask_agent', type: 'mutation' },
    ],
  },
];

// ==================== BATTLE TERMINAL DATA ====================

export const mockToolCalls: ToolCall[] = [
  {
    id: 'tc_001',
    name: 'read_file',
    inputs: { path: 'src/refund.ts' },
    outputs: { content: 'export async function processRefund() {...}' },
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    correlationId: 'corr_001',
    artifactLinks: [],
  },
  {
    id: 'tc_002',
    name: 'run_tests',
    inputs: { scope: 'refund' },
    outputs: { passed: 15, failed: 0, coverage: 0.92 },
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    correlationId: 'corr_001',
    artifactLinks: [],
  },
  {
    id: 'tc_003',
    name: 'analyze_code',
    inputs: { file: 'src/refund.ts' },
    outputs: null,
    status: 'running',
    timestamp: new Date(Date.now() - 1000 * 30),
    correlationId: 'corr_001',
    artifactLinks: [],
  },
];

export const mockTerminalOptions: TerminalOption[] = [
  { id: 'opt_001', label: 'OPEN_DIFF', action: 'open_diff', type: 'inspection' },
  { id: 'opt_002', label: 'CHECK_LOGS', action: 'check_logs', type: 'inspection' },
  { id: 'opt_003', label: 'APPROVE', action: 'approve', type: 'mutation', prerequisite: 'all_checks_passed' },
  { id: 'opt_004', label: 'REQUEST_CHANGES', action: 'request_changes', type: 'mutation' },
  { id: 'opt_005', label: 'ASK_CLARIFY', action: 'ask_clarify', type: 'mutation' },
  { id: 'opt_006', label: 'RUN_TESTS', action: 'run_tests', type: 'mutation' },
];

// ==================== HELPER FUNCTIONS ====================

export function getProjectAgents(projectId: string): Agent[] {
  return mockAgents.filter(a => a.projectId === projectId);
}

export function getProjectWorktrees(projectId: string): Worktree[] {
  return mockWorktrees.filter(w => w.projectId === projectId);
}

export function getProjectBeads(projectId: string): Bead[] {
  return mockBeads.filter(b => b.projectId === projectId);
}

export function getAgentBeads(agentId: string): Bead[] {
  return mockBeads.filter(b => b.agentId === agentId);
}

export function getProjectStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: 'bg-slate-500',
    working: 'bg-emerald-500',
    blocked: 'bg-amber-500',
    error: 'bg-red-500',
    awaiting_approval: 'bg-violet-500',
  };
  return colors[status] || 'bg-slate-500';
}

export function getStatusGlow(status: string): string {
  const glows: Record<string, string> = {
    idle: 'shadow-slate-500/50',
    working: 'shadow-emerald-500/50 animate-pulse',
    blocked: 'shadow-amber-500/50',
    error: 'shadow-red-500/50 animate-pulse',
    awaiting_approval: 'shadow-violet-500/50',
  };
  return glows[status] || 'shadow-slate-500/50';
}
