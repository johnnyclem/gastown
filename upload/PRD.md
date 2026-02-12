# PRD: Gastown Town Command Center (Real-time AI Agent Orchestration)

Version: 0.1 (Draft)
Date: 2026-02-10
Status: Draft for implementation

## Product Setup

- [x] Define product name, tagline, and one-line positioning statement aligned to "speed without evidence breeds quarrels; memory and clear gates create trust that survives real time"
  - Product name: Gastown Command Center
  - Tagline: Speed with evidence. Memory at every gate.
  - Positioning statement: A real-time command-and-control center for multi-agent software delivery where every operational decision remains traceable to immutable evidence.
- [x] Establish normative language standard across all specs (MUST/SHOULD/MAY) and enforce via documentation linting in CI
  - Normative terms MUST follow RFC 2119 + RFC 8174 interpretation.
  - Lint rule: all requirement statements in `/docs/specs/**` MUST include one of `MUST`, `SHOULD`, or `MAY`.
- [x] Create a single source of truth glossary for town metaphor terms mapped to technical entities (copy dictionary), with automated lint rules preventing metaphor drift in UI strings and event names
  - Source of truth location: `docs/glossary/metaphor-map.yaml`
  - Drift rule: UI copy MUST use metaphor keys; event types MUST use technical entity names.
- [x] Define multi-tenant boundary and identity model (`tenant_id`, users, service accounts) as a prerequisite for all downstream schemas and RBAC rules
  - Tenant boundary key: `tenant_id` (UUID v7)
  - Actor model: `user_id` or `service_account_id` plus `role`
  - Every persisted entity and event MUST carry `tenant_id`.
- [x] Define evidence deep-link URL scheme and persistence requirements (IDs, routing, retention) used across UI and audit ledger
  - App route form: `/t/{tenant_id}/{resource}/{id}`
  - Canonical evidence deep links MUST include `tenant_id` and at least one of `event_id`, `artifact_id`, `project_id`, `agent_id`.
  - Deep links MUST resolve historically in replay mode.
- [x] Select and document realtime transport strategy (WebSocket default, SSE fallback) and snapshot+cursor replay protocol as a hard contract between client and server
  - Transport default: WebSocket
  - Transport fallback: SSE
  - Replay contract: `snapshot(version, cursor_highwater)` then ordered `event_batch(cursor_start..cursor_end)`.
- [x] Establish event store immutability policy (append-only, never rewrite), projection determinism requirements, and N-1 event version reducer policy
  - Event store MUST be append-only and immutable.
  - Reducers MUST be deterministic and side-effect free.
  - N-1 policy: reducer version N MUST support replay of event schema versions N and N-1.
- [x] Define performance budgets (latency, throughput, memory) and measurement plan (client timings, server timings, end-to-end tracing)
  - Important event render latency target: < 500 ms typical, P95 < 900 ms, P99 < 1500 ms.
  - Concurrent live projects target: 100.
  - Searchable projects target: 200+ with P95 query latency < 250 ms.

## Core Implementation

### Overview

- [x] Write product overview (1-2 paragraphs) that MUST explicitly state:
  - What it is: Gastown Command Center is a real-time command-and-control center for Gastown and Beads workflows with Git lifecycle visualization for multi-agent work. It provides a shared, evidence-backed operational view across agents, operators, and administrators.
  - What problems it solves: It improves operability, governance, evidence and causality traceability, merge fidelity, and cross-project coordination during constant change.
  - What it is not: It is not employee surveillance, not a replacement for Git providers, and not a system for opaque or evidence-free approvals.
  - Anti-surveillance stance: The system is for remembering and proving decisions, not watching people.
- [x] Define truth touchpoints requirement: every summarized UI element MUST provide an unbroken drill-down path to raw evidence artifacts via stable deep links

### Users, Roles, and Permissions (RBAC)

- [x] Define roles: Viewer, Operator, Mayor/Admin, Service Accounts with explicit goals and what each role is protecting
  - Viewer protects awareness quality and shared truth.
  - Operator protects project flow and correctness inside granted scopes.
  - Mayor/Admin protects city-wide policy, incident safety, and governance.
  - Service Account protects automation integrity and idempotent operations.
- [x] Define RBAC permission matrix mapping role -> allowed command types (write) and allowed streams/screens (read)

| Role | Read Scope | Write Scope | Protected Surface |
|---|---|---|---|
| Viewer | Town Map, evidence panels, replay views | None | Situational awareness |
| Operator | Town Map, assigned Building Interiors, scoped Battle Terminals | Scoped operational commands within granted `project_id`/`agent_id` | Project execution integrity |
| Mayor/Admin | All screens including City Hall and global queues | Global policy, incidents, cross-project approvals, dangerous actions with confirmation | City-wide safety and governance |
| Service Account | No UI | API-only automation commands in scoped allowlist | Automation correctness |

- [x] Specify default landing screen per role
  - Viewer -> Town Map
  - Operator -> Town Map with scoped filters + Building Interior for assigned projects
  - Mayor/Admin -> City Hall (global queue + policy + incidents)
  - Service Accounts -> no UI; API-only actor with scoped command set
- [x] Specify audit expectations per role: every state-changing action MUST emit both `command.*` and `audit.ledger_entry`
- [x] Enforce scope rules
  - Viewer cannot write any command events.
  - Operator writes only within granted `project_id`/`agent_id` scopes.
  - Mayor/Admin writes global policy, incidents, and cross-project approvals; dangerous actions require explicit confirmation capturing what was visible.
  - Service accounts restricted to automation actions with per-tenant idempotency keys.

### Product Principles -> Enforceable Rules (The Two Plaques)

#### Plaque 1: "We don't watch to distrust; we watch to remember."

- [x] Enforceable system rules
  - Every user-visible decision point MUST capture who/what/when/why/what-evidence-was-visible in immutable audit events.
  - Timeline MUST be replayable from `snapshot(version, cursor_highwater)` + event stream.
  - Causality MUST be traceable via propagated `correlation_id` and `causation_id` across UI commands, agent tool calls, Git events, and CI checks.
- [x] UX rules
  - Every summarized status icon MUST open details with precise derived fields and linked evidence.
  - Proof river timeline MUST deep-link to raw artifacts (diffs, logs, check runs, prompts, tool outputs).
- [x] Missing evidence (fog-of-war) rules
  - If required evidence is unavailable, UI MUST show explicit `unknown because...` reasons.
  - Actions requiring missing evidence MUST be blocked, or require explicit `proceed_with_missing_evidence` confirmation (Mayor/Admin only), which MUST generate audit containing missing evidence list.

#### Plaque 2: "We don't merge to finish; we merge to fit."

- [x] Deterministic gating rules
  - Merge eligibility MUST be computed deterministically from policy + CI truth + repository state.
  - High-risk changes MUST require human signoff.
  - Policy ambiguity MUST require explicit human signoff.
- [x] UX rules
  - Merge Traffic MUST show gate state (Green/Yellow/Red) with deterministic reason codes and deep links to checks, diffs, and policy clauses.
  - Rework loop MUST be explicit: failures generate required-actions and lane block/unblock states.
- [x] Failure handling
  - On failed checks/conflicts, system MUST create actionable rework ticket with required evidence and next steps.
  - Merge queue advancement MUST remain blocked until policy-defined resolution.

### Scope / Non-Goals

- [x] In-scope
  - Real-time orchestration across up to 100 live projects with filtering/search across 200+ projects.
  - Town metaphor UI with pixel-art/isometric/diegetic layouts.
  - Git lifecycle + CI + merge queues as logistics/highway metaphors with deterministic mapping to provider operations.
  - Immutable audit ledger with deep links and replay capability.
- [x] Non-goals
  - Employee surveillance and keystroke monitoring.
  - Non-deterministic approvals without evidence.
  - Rewriting audit history.
  - Replacing Git providers as source-of-truth.

### Success Metrics and Acceptance Criteria

- [x] Define important events for latency SLO
  - Commands issued
  - Approvals
  - Acknowledgements
  - Merge queue changes
  - CI check state changes
  - Conflict detection
  - Incident toggles
  - Agent state changes (`blocked`/`error`)
  - Artifact arrival (diff/log/tool output)
- [x] Latency SLO
  - Typical UI update latency for important events MUST be < 500 ms end-to-end.
  - P95 and P99 MUST be measured and exposed on dashboards.
- [x] Scale
  - Must support 100 live projects concurrently updating.
  - Must support 200+ searchable/filterable projects with defined response targets.
- [x] Audit completeness
  - 100% of commands, approvals, acknowledgements MUST have immutable ledger entries with actor attribution and evidence links.
- [x] Merge pipeline fidelity
  - Gate states MUST match CI/policy truth deterministically; discrepancies MUST surface as incidents.
- [x] Replay integrity
  - Snapshot + cursor replay MUST converge to identical derived state within defined eventual-consistency bounds.

### Canonical Metaphor Map (Drift-Proof)

- [x] Create canonical mapping table: Metaphor Term -> Technical Entity -> Required IDs -> Primary Screens -> Key Events

| Metaphor Term | Technical Entity | Required IDs | Primary Screens | Key Events |
|---|---|---|---|---|
| Mayor / City Hall | Tenant admin and governance control plane | `tenant_id`, `actor_id` | City Hall | `command.policy.*`, `command.incident.*`, `audit.ledger_entry` |
| Crew | Human operator group | `tenant_id`, `user_id`, `project_id` | Town Map, Building Interior | `command.assignment.*` |
| Sentry / Clerk | Audit recorder and policy checker | `tenant_id`, `event_id`, `ledger_entry_id` | Details panels, ledger views | `audit.ledger_entry`, `policy.evaluated` |
| Building | Project | `tenant_id`, `project_id` | Town Map, Building Interior | `project.state_changed`, `project.blocked` |
| Bead / Quest | Task or unit of agent work | `tenant_id`, `bead_id`, `project_id` | Building Interior, Battle Terminal | `bead.created`, `bead.updated`, `bead.blocked` |
| Artifact / Evidence | Immutable evidence object | `tenant_id`, `artifact_id` | All details panels | `artifact.recorded` |
| Room / Worktree | Branch/worktree workspace | `tenant_id`, `worktree_id`, `branch_name` | Building Interior | `worktree.created`, `worktree.archived` |
| Package | Commit | `tenant_id`, `commit_sha`, `repo_id` | Building Interior, Highway | `git.commit_observed` |
| Truck | Push/PR movement | `tenant_id`, `push_id`, `pr_id` | Highway / Merge Traffic | `git.push_observed`, `pr.updated` |
| Highway Lane | Merge queue lane | `tenant_id`, `lane_id` | Highway / Merge Traffic | `merge_queue.updated` |
| Toll Booth / Gate | CI check run and policy gate | `tenant_id`, `check_run_id`, `policy_version` | Highway / Merge Traffic, Battle Terminal | `ci.check_updated`, `policy.gate_evaluated` |
| Conflict Encounter | Merge conflict workflow | `tenant_id`, `conflict_id`, `pr_id` | Highway / Merge Traffic | `merge.conflict_detected`, `merge.conflict_resolved` |

- [x] Define UI drill-down ladder rules
  - Metaphor label -> tooltip (key derived fields) -> details panel (full derived state + reasons) -> raw evidence view.
- [x] Define naming conventions
  - Town-facing copy MUST avoid technical terms except in raw views.
  - `Package` maps to commit.
  - `Truck` maps to push/PR movement.
  - `Gate`/`Toll` maps to CI checks.
- [x] Enforce drift prevention
  - CI copy dictionary linting for metaphor keys.
  - Event naming linting where event types use technical names only.

### Domain Model (Entities, IDs, Relationships)

- [x] Define canonical entities with required IDs (all include `tenant_id`)
  - `tenant`
  - `project`
  - `agent`
  - `bead`
  - `artifact`
  - `worktree`
  - `commit`
  - `push`
  - `pull_request`
  - `merge_lane`
  - `check_run`
  - `incident`
  - `policy`
  - `audit_ledger_entry`
- [x] Define relationship rules
  - Project has many worktrees/rooms.
  - Worktree references branch/worktree identifiers and current `head_sha`/`base_sha`.
  - Bead links to project and optional agent; bead references required artifacts and status gates.
  - Artifacts are immutable, preferably content-addressed, and referenced from events and projections.
  - All commands target explicit entity IDs and scope and link evidence or missing-evidence record.
- [x] Define global deep-link format requirements
  - Links MUST remain stable and replay-safe.
  - Links MUST include `tenant_id` and at least one of `event_id`, `artifact_id`, `project_id`, `agent_id`.

#### Canonical Deep Link Schemes

- Web: `/t/{tenant_id}/events/{event_id}`
- Web: `/t/{tenant_id}/artifacts/{artifact_id}`
- Web: `/t/{tenant_id}/projects/{project_id}?agent_id={agent_id}`
- App URI: `gastown://t/{tenant_id}/{resource}/{id}`

### UX Architecture (Enforceable Screen Specs)

#### Town Map (Global Overview)

- [x] Implement tilemap with projects as buildings and deterministic lantern states: `idle`, `working`, `blocked`, `error`, `awaiting_approval`
- [x] Define tooltip fields
  - `project_id`
  - `status_reason_codes[]`
  - `last_important_event_at`
  - `top_blockers[]`
  - `evidence_links[]`
- [x] Define top-bar meters with formulas
  - `%_projects_blocked = blocked_projects / total_projects`
  - `pending_approvals_count = count(approval_requested where status=pending)`
  - `merge_queue_health = green_lanes / total_lanes`
- [x] Implement diegetic dependencies with optional technical overlay persisted per user preference
- [x] Implement filtering/search/alert triage
  - Filter predicates: `status`, `owner_crew`, `agent_id`, `repo_provider`, `incident_state`, `risk_level`
  - Search rules: exact ID match rank 1, prefix rank 2, substring rank 3
  - Town Crier signboard supports severity grouping and acknowledgement lifecycle; acknowledge emits command + audit event
- [x] Implement LOD behavior
  - Far: aggregate counts and major incidents
  - Mid: per-building lanterns + top blocker
  - Near: mini badges (pending approvals, failing checks, conflicts) with evidence links

#### Building Interior (Project Detail)

- [x] Implement isometric interior where rooms map to worktrees/branches with deterministic lifecycle
- [x] Define room retention/archival rules; archived rooms remain replayable
- [x] Render agent sprites with status bubbles from `AgentState`
- [x] Implement quest log with intervention metadata: `last_intervenor`, `reason`, `timestamp`, `evidence_links`
- [x] Implement artifact hotspots for `diff`, `ci_log`, `runtime_log`, `agent_tool_output`, `policy_decision`
- [x] Define local alert toast rules with never-drop classes, grouping, and snooze vs acknowledge semantics

#### Battle Terminal (Agent)

- [x] Implement battle layout
  - Arena shows current `agent_request` or bead goal
  - Bottom input supports `Ctrl+Enter` send, multiline rules, and command preview for state changes
  - Right proof river timeline with filters and deep links
  - Top meters with explicit formulas and provenance links
- [x] Provide canonical ordered options
  - `APPROVE`
  - `REQUEST_CHANGES`
  - `ASK_CLARIFY`
  - `RUN_TESTS`
  - `OPEN_DIFF`
  - `CHECK_LOGS`
  - `DEPLOY`
- [x] Implement streaming output behavior
  - Tool-call cards include inputs, outputs, timestamps, `correlation_id`, artifact links
  - Inline diff viewer links PR and commit
- [x] Implement keyboard-only navigation, deterministic focus order, accessible labels

#### Battle Terminal (Mayor)

- [x] Provide deterministic strategic options
  - `DECLARE_INCIDENT`
  - `PAUSE_MERGE_LANES`
  - `REQUIRE_SIGNOFF`
  - `OVERRIDE_WITH_EVIDENCE`
  - `ASSIGN_OPERATORS`
  - `REQUEST_STATUS_REPORT`
- [x] Require Mayor ledger confirmation for dangerous actions
  - Confirmation MUST show evidence viewed, missing evidence, implicated policy clauses, expected blast radius
  - Confirm action MUST emit immutable audit references for what was seen

#### Highway / Merge Traffic

- [x] Implement merge queue lanes as truck lanes with deterministic gate states and reason codes
- [x] Define clustering/stacking while preserving individual drill-down
- [x] Implement conflict encounter flow
  - `AUTO_RESOLVE` (policy-allowed only)
  - `OPEN_CONFLICT_FILES`
  - `ASK_AGENT` (blocks lane pending clarification)
  - `ABORT_MERGE` (command + audit + lane change)
- [x] Define risk gates and required evidence per resolution path

#### City Hall (Mayor Command Center)

- [x] Implement global queue view with deterministic ordering
- [x] Implement policy toggles with versioning, effective times, audit trail
- [x] Implement incident controls with explicit scope, expiry, and replay history
- [x] Implement coordination issue detection module
  - Detection MUST include heuristic, evidence links, remediation commands
  - Remediation MUST be role-gated and audited

#### Cross-cutting UX Specs

- [x] Search/filter grammar, ranking, and saved filters per user preferences
- [x] Alerts taxonomy, dedupe keys, grouping windows, ack vs snooze semantics
- [x] LOD exact fields per zoom level with guaranteed evidence access
- [x] Global/context hotkeys that are discoverable and accessible
- [x] Accessibility requirements (colorblind-safe states, keyboard nav, screen reader labels)
- [x] Fog-of-war unknown states and blocked action rules
- [x] Offline/disconnect mode: read-only replay with stale indicators and cursor replay recovery

### Interaction Model (Deterministic Option Generator)

- [x] Define deterministic question -> options generator
  - Inputs: `agent_request`, `policy_state`, `project_state`, `role_permissions`
  - Outputs: ordered options list, sub-actions, default focus
- [x] Provide decision table dimensions
  - Role: Viewer/Operator/Mayor
  - Evidence: complete/partial/missing
  - Risk: low/medium/high
  - Merge state: green/yellow/red/conflict
  - Policy ambiguity: clear/ambiguous
- [x] Define pseudocode rules
  - Stable ordering for same inputs
  - Inspection options separated from state-changing options
  - State-changing options list prerequisites and evidence requirements
- [x] Define option semantics for each canonical option
  - Target entity/scope/expiration
  - Emitted command events and expected domain events
  - Block/unblock transitions
- [x] Clarification mechanics
  - `ASK_CLARIFY` creates blocking state with reason `awaiting_clarification`
  - Resolution records responder, timestamp, and added artifacts

#### Deterministic Option Ordering Pseudocode

```text
inputs = (role, evidence_state, risk_level, merge_state, policy_ambiguity, policy_ruleset_version)

inspection = [OPEN_DIFF, CHECK_LOGS]
mutating = [APPROVE, REQUEST_CHANGES, ASK_CLARIFY, RUN_TESTS, DEPLOY]

if role == VIEWER:
  return inspection

if evidence_state == MISSING:
  mutating = [ASK_CLARIFY]

if risk_level == HIGH or policy_ambiguity == AMBIGUOUS:
  remove APPROVE unless explicit_signoff_present

if merge_state in [RED, CONFLICT]:
  move REQUEST_CHANGES and ASK_CLARIFY to front of mutating

return stable_sort(inspection + mutating, by=predefined_rank)
```

### Meter Derivations (Explicit Formulas)

- [x] Define formulas and provenance for all meters
  - Progress: `completed_beads / total_beads_in_scope`
  - Tests: `passing_required_checks / required_checks(policy_version)`
  - Risk: weighted policy rule score with explicit rule IDs
  - Confidence: function of explicit evidence completeness, recency, and check health (no hidden heuristics)
  - Tokens/Cost: sum of token/cost fields from tool usage events in selected scope

### Audit / Bookmarking Rules (What was seen at time of choice)

- [x] Define evidence viewed capture requirements
  - Viewing critical artifacts SHOULD emit `evidence.viewed` events.
  - Dangerous actions MUST embed viewed evidence references in confirmation audit events.
- [x] Define audit minimum fields
  - `tenant_id`
  - `ledger_entry_id`
  - `actor_id` or `service_account_id`
  - `role`
  - `scope`
  - `command_intent`
  - `policy_version`
  - `evidence_refs[]`
  - `missing_evidence_refs[]`
  - `timestamp`
  - `correlation_id`
  - `causation_id`

### Git-as-Logistics Specification

- [x] Define deterministic mapping table
  - Package <-> commit (`commit_sha`)
  - Truck <-> push/PR movement (`push_id`, `pr_id`)
  - Highway lane <-> merge queue lane (`lane_id`)
  - Gatekeeper <-> policy engine + required checks
  - Toll booth <-> CI check run (`check_run_id`)
  - Conflict encounter <-> merge conflict event with file list artifacts
- [x] Require IDs/links
  - `commit_sha`
  - `pr_id`
  - `check_run_id`
  - `push_id`
  - `worktree_id`
  - `branch_name`
  - `base_sha`
  - `head_sha`
  - `repo_id`
  - `provider`

#### Provider Adapter Contract (Required)

- [x] Each provider adapter MUST expose normalized operations
  - `observe_push`
  - `observe_pr`
  - `observe_check_run`
  - `read_diff_artifact`
  - `read_conflict_artifact`
  - `enqueue_merge`
  - `dequeue_merge`
- [x] Adapter outputs MUST include normalized IDs and raw provider links for evidence deep-linking.

### Event Taxonomy and Contracts

- [x] Define immutable event namespaces
  - `command.*`
  - `domain.*`
  - `integration.*`
  - `projection.*` (optional internal diagnostics)
  - `audit.*`
- [x] Define minimum event envelope
  - `event_id`
  - `event_type`
  - `event_version`
  - `tenant_id`
  - `occurred_at`
  - `recorded_at`
  - `actor`
  - `correlation_id`
  - `causation_id`
  - `entity_type`
  - `entity_id`
  - `payload`
  - `evidence_refs[]`
- [x] Determinism and ordering
  - Events MUST be replayed in `(recorded_at, event_id)` total order per tenant partition.
  - Reducers MUST ignore unknown forward-compatible fields.

### Security and Compliance Requirements

- [x] Tenant isolation
  - Cross-tenant reads/writes MUST be denied at API and query layers.
- [x] Least privilege
  - Service account scopes MUST be explicit allowlists and rotated.
- [x] Sensitive data
  - PII and secrets MUST NOT appear in UI summaries or event payloads without explicit redaction policy.
- [x] Audit retention
  - Ledger entries MUST meet configured retention policy and remain immutable for retention duration.

### Testing and Validation Plan

- [x] Deterministic replay tests
  - Given snapshot + cursor, replay MUST produce identical projections.
- [x] Audit coverage tests
  - All mutating commands MUST produce paired audit ledger entry.
- [x] RBAC tests
  - Matrix tests MUST verify deny-by-default and scoped allow rules.
- [x] Transport tests
  - WebSocket and SSE fallback MUST produce equivalent observable event sequences.
- [x] Scale and latency tests
  - 100 live project update simulation and 200+ search/filter queries under target P95/P99.
- [x] Accessibility tests
  - Keyboard-only flow coverage and screen reader label assertions for actionable controls.

### Delivery Milestones

- [ ] Milestone 1: Event model + immutable ledger + deep-link contract + RBAC foundation
- [ ] Milestone 2: Town Map + Building Interior with deterministic projections and evidence drill-down
- [ ] Milestone 3: Battle Terminals + deterministic option generator + major command flows
- [ ] Milestone 4: Highway/Merge Traffic + policy gating + conflict encounter loops
- [ ] Milestone 5: City Hall governance + incident orchestration + scale hardening + acceptance tests

### Open Questions

- [ ] Should confidence meter default to hidden unless provenance links are complete?
- [ ] Which Git providers are first-class in v1 adapter coverage?
- [ ] What is the final retention duration per tenant tier?
- [ ] What policy DSL format is selected for deterministic gate evaluation?

