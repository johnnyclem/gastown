# Gastown Command Center Initial Ticket Specs

Source artifacts:
- PRD: `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/PRD.md`
- Epics: `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/docs/implementation/EPICS.md`

## Ticket Readiness Standard

A ticket in this document is "ready" when:
- Scope fits 1-2 engineering days.
- Dependencies are explicit.
- Acceptance criteria are testable and deterministic.
- Verification evidence is named.
- Deliverables map to concrete artifacts (code, tests, docs, dashboard panels).

## Backlog Index

| Ticket ID | Epic | Title | Priority | Estimate | Dependencies |
|---|---|---|---|---|---|
| GCC-E1-001 | GCC-E1 | Canonical Event Envelope and Schema Registry | P0 | 2d | None |
| GCC-E1-002 | GCC-E1 | Append-Only Event Store and Immutable Audit Ledger | P0 | 2d | GCC-E1-001 |
| GCC-E1-003 | GCC-E1 | Snapshot+Cursor Replay API with WS/SSE Contract | P0 | 2d | GCC-E1-001, GCC-E1-002 |
| GCC-E1-004 | GCC-E1 | Tenant Identity Model and RBAC Authorization Guards | P0 | 2d | GCC-E1-001 |
| GCC-E1-005 | GCC-E1 | Evidence Deep-Link Router and Resolver | P1 | 1d | GCC-E1-001, GCC-E1-002 |
| GCC-E1-006 | GCC-E1 | CI Lints for Normative Language and Metaphor Drift | P1 | 1d | None |
| GCC-E2-001 | GCC-E2 | Deterministic Projection Model for Town and Building Status | P0 | 2d | GCC-E1-002, GCC-E1-004 |
| GCC-E2-002 | GCC-E2 | Town Map Canvas with LOD and Evidence Entry Points | P1 | 2d | GCC-E2-001, GCC-E1-005 |
| GCC-E2-003 | GCC-E2 | Search and Filter Grammar with Stable Ranking | P1 | 1d | GCC-E2-001 |
| GCC-E2-004 | GCC-E2 | Town Crier Alerts with Ack vs Snooze Semantics | P1 | 2d | GCC-E2-001, GCC-E1-004 |
| GCC-E2-005 | GCC-E2 | Building Interior Room Lifecycle and Artifact Hotspots | P1 | 2d | GCC-E2-001, GCC-E1-005 |
| GCC-E3-001 | GCC-E3 | Deterministic Option Generator Service | P0 | 2d | GCC-E1-004, GCC-E2-001 |
| GCC-E3-002 | GCC-E3 | Agent Battle Terminal Shell and Keyboard Model | P1 | 2d | GCC-E3-001, GCC-E2-005 |
| GCC-E3-003 | GCC-E3 | Proof River Streaming Cards with Correlation Links | P1 | 2d | GCC-E1-003, GCC-E1-005, GCC-E2-005 |
| GCC-E3-004 | GCC-E3 | Meter Derivation and Provenance Panels | P1 | 2d | GCC-E2-001, GCC-E3-003 |
| GCC-E3-005 | GCC-E3 | Mayor Dangerous Action Confirmation and Ledger Capture | P0 | 2d | GCC-E1-002, GCC-E1-004, GCC-E3-001 |
| GCC-E4-001 | GCC-E4 | Provider Adapter Contract and Normalization Layer | P0 | 2d | GCC-E1-001, GCC-E1-005 |
| GCC-E4-002 | GCC-E4 | Merge Lane State Machine and Deterministic Gate Evaluator | P0 | 2d | GCC-E4-001, GCC-E1-002 |
| GCC-E4-003 | GCC-E4 | Highway Merge Traffic UI with Lane Clustering | P1 | 2d | GCC-E4-002, GCC-E2-002 |
| GCC-E4-004 | GCC-E4 | Conflict Encounter Resolution Command Flows | P0 | 2d | GCC-E4-002, GCC-E3-001 |
| GCC-E4-005 | GCC-E4 | Rework Ticket Generation and Lane Block/Unblock Rules | P0 | 2d | GCC-E4-004, GCC-E2-004 |
| GCC-E4-006 | GCC-E4 | Gate Reconciliation Job and Incident Emission | P1 | 1d | GCC-E4-002, GCC-E1-002 |
| GCC-E5-001 | GCC-E5 | City Hall Global Queue with Deterministic Ordering | P1 | 2d | GCC-E2-001, GCC-E4-002 |
| GCC-E5-002 | GCC-E5 | Policy Control Plane Versioning and Effective Times | P1 | 2d | GCC-E1-002, GCC-E1-004 |
| GCC-E5-003 | GCC-E5 | Incident Controls with Scope, Expiry, and Replayable History | P1 | 2d | GCC-E5-001, GCC-E5-002 |
| GCC-E5-004 | GCC-E5 | Coordination Detector with Evidence-Linked Remediation | P2 | 2d | GCC-E5-001, GCC-E4-006 |
| GCC-E5-005 | GCC-E5 | Offline Replay Mode and Reconnect Recovery | P1 | 2d | GCC-E1-003, GCC-E2-002 |
| GCC-E5-006 | GCC-E5 | Acceptance Harness and SLO/Audit/Replay Dashboards | P0 | 2d | GCC-E2-005, GCC-E3-005, GCC-E4-006, GCC-E5-005 |

---

## GCC-E1 Tickets

### GCC-E1-001: Canonical Event Envelope and Schema Registry

- Objective: establish a single immutable event envelope contract with schema validation and versioning.
- Scope: envelope schema definitions, validation middleware, schema registry loader.
- Non-goals: event transport retries, projection implementations.
- Acceptance criteria:
  1. Every persisted event MUST include the required envelope fields from PRD `Event Taxonomy and Contracts`.
  2. Ingest path MUST reject invalid events with deterministic error codes.
  3. Registry MUST support `event_version` and compatibility checks for N and N-1.
  4. Unit tests MUST cover valid/invalid fixtures for at least `command.*`, `audit.*`, and `integration.*` events.
- Verification: schema fixture tests and contract tests.
- Deliverables: event schema module, ingest validator, test fixtures, developer docs.

### GCC-E1-002: Append-Only Event Store and Immutable Audit Ledger

- Objective: enforce append-only persistence and immutable audit pairing.
- Scope: event append API, immutable ledger append API, command->audit pairing hook.
- Non-goals: historical data migration.
- Acceptance criteria:
  1. Store APIs MUST expose append operations only; update/delete APIs MUST be absent or denied.
  2. Every state-changing command MUST emit an `audit.ledger_entry` within the same logical operation.
  3. Ledger entries MUST reference command `event_id`, actor identity, and evidence refs.
  4. Integration tests MUST verify immutable behavior under concurrent writes.
- Verification: integration tests for append-only invariants and command/audit pairing.
- Deliverables: storage adapter changes, audit writer, concurrency tests.

### GCC-E1-003: Snapshot+Cursor Replay API with WS/SSE Contract

- Objective: implement replay-safe transport contract for live and reconnect flows.
- Scope: snapshot endpoint, cursor event stream endpoint, WS negotiation with SSE fallback.
- Non-goals: offline UI behavior (covered in GCC-E5-005).
- Acceptance criteria:
  1. Client session MUST be able to request `snapshot(version, cursor_highwater)`.
  2. Stream API MUST deliver ordered events after `cursor_highwater` without gaps.
  3. Transport MUST default to WebSocket and fallback to SSE on unsupported/failed WS.
  4. Overflow path MUST trigger snapshot refresh with explicit cursor reset reason code.
- Verification: protocol tests for connect, reconnect, overflow, and fallback scenarios.
- Deliverables: transport handlers, replay controller, protocol documentation.

### GCC-E1-004: Tenant Identity Model and RBAC Authorization Guards

- Objective: enforce tenant isolation and role-scoped writes/reads.
- Scope: tenant context propagation, actor identity abstraction, role matrix guard middleware.
- Non-goals: SSO provider integration details.
- Acceptance criteria:
  1. All commands and events MUST include `tenant_id`.
  2. RBAC guards MUST deny by default and permit only explicit matrix grants.
  3. Operator writes MUST fail outside granted `project_id`/`agent_id` scope.
  4. Service accounts MUST require scoped command allowlists and idempotency keys.
- Verification: RBAC matrix tests across Viewer/Operator/Mayor/Service Account.
- Deliverables: authz middleware, scope validator, RBAC test suite.

### GCC-E1-005: Evidence Deep-Link Router and Resolver

- Objective: make all evidence links stable, replay-safe, and entity-addressable.
- Scope: canonical route resolver for events/artifacts/projects/agents, deep-link parser.
- Non-goals: provider-hosted artifact rendering.
- Acceptance criteria:
  1. Deep-link routes MUST include `tenant_id` and at least one required entity anchor ID.
  2. Resolver MUST map route -> immutable entity reference deterministically.
  3. Replay mode MUST resolve the same link target for historical contexts.
  4. Invalid or expired links MUST return deterministic error states with reason codes.
- Verification: link-resolution tests across live/replay paths.
- Deliverables: router bindings, resolver service, route contract docs.

### GCC-E1-006: CI Lints for Normative Language and Metaphor Drift

- Objective: prevent specification and copy drift from PRD contracts.
- Scope: docs lint rule for `MUST/SHOULD/MAY`, copy dictionary lint, event naming lint.
- Non-goals: localization infrastructure.
- Acceptance criteria:
  1. Spec files under `/docs/specs/**` MUST fail CI when normative keywords are missing.
  2. UI strings MUST map to canonical metaphor dictionary keys.
  3. Event type names MUST use technical entity naming and fail on metaphorized types.
  4. CI output MUST include actionable file/line diagnostics.
- Verification: lint fixtures for pass/fail cases.
- Deliverables: lint scripts, CI config, contributor guidance.

---

## GCC-E2 Tickets

### GCC-E2-001: Deterministic Projection Model for Town and Building Status

- Objective: derive Town Map and Building Interior state from immutable events only.
- Scope: projector modules for lantern states, blockers, top-bar meter sources.
- Non-goals: final UI rendering.
- Acceptance criteria:
  1. Lantern states MUST be derived deterministically (`idle`, `working`, `blocked`, `error`, `awaiting_approval`).
  2. Projection output MUST include reason codes and supporting evidence refs.
  3. Rebuild from same event stream MUST produce byte-equivalent projection output.
  4. Projection contract MUST expose `last_important_event_at` and `top_blockers` fields.
- Verification: replay determinism tests and projection snapshot tests.
- Deliverables: projection service, schema definitions, replay tests.

### GCC-E2-002: Town Map Canvas with LOD and Evidence Entry Points

- Objective: render global project state with zoom-level contracts and drill-down links.
- Scope: tilemap canvas, LOD renderer, tooltip/detail interactions.
- Non-goals: animation polish and theming variants.
- Acceptance criteria:
  1. Far/mid/near zoom levels MUST display exact field sets defined in PRD.
  2. Hover/click interactions MUST expose `project_id`, reason codes, and evidence links.
  3. Technical overlay toggle state MUST persist per user preference.
  4. Every summarized icon MUST open a details panel with derivation context.
- Verification: component tests and deterministic UI state tests.
- Deliverables: Town Map components, LOD config, interaction tests.

### GCC-E2-003: Search and Filter Grammar with Stable Ranking

- Objective: provide deterministic triage filtering for 200+ projects.
- Scope: query parser, ranking strategy, saved filter persistence.
- Non-goals: semantic/vector search.
- Acceptance criteria:
  1. Query parser MUST support status, owner/crew, agent, provider, incident, and risk predicates.
  2. Ranking MUST prioritize exact ID matches over prefix over substring.
  3. Saved filters MUST persist per user and MUST NOT emit domain events.
  4. P95 search/filter response MUST meet target (<250 ms for planned dataset profile).
- Verification: parser tests, ranking tests, performance benchmark test.
- Deliverables: query service, persistence adapter for preferences, benchmark report.

### GCC-E2-004: Town Crier Alerts with Ack vs Snooze Semantics

- Objective: implement alert triage lifecycle with auditable acknowledgement and local snooze.
- Scope: severity grouping, dedupe keys, ack command flow, snooze preference flow.
- Non-goals: external paging integration.
- Acceptance criteria:
  1. Alerts MUST be grouped by severity and dedupe key within configured windows.
  2. Acknowledge action MUST emit `command.*` and matching `audit.ledger_entry`.
  3. Snooze action MUST remain user-local preference and MUST NOT mutate domain state.
  4. Local toasts MUST honor never-drop alert classes.
- Verification: workflow tests for ack/snooze and alert grouping behavior.
- Deliverables: alert pipeline, ack command handlers, UI lifecycle tests.

### GCC-E2-005: Building Interior Room Lifecycle and Artifact Hotspots

- Objective: deliver project detail screen with room/worktree lifecycle and artifact drill-down.
- Scope: room create/close/retain/archive state rendering, archived replay view, artifact hotspots.
- Non-goals: advanced sprite animations.
- Acceptance criteria:
  1. Room lifecycle transitions MUST be event-driven and deterministic.
  2. Archived rooms MUST remain visible in replay mode with history shutter links.
  3. Artifact hotspots MUST support `diff`, `ci_log`, `runtime_log`, `agent_tool_output`, `policy_decision`.
  4. Intervention metadata MUST show last intervenor, reason, timestamp, and evidence links.
- Verification: lifecycle projection tests and UI integration tests.
- Deliverables: interior view components, room lifecycle adapter, artifact panel integration.

---

## GCC-E3 Tickets

### GCC-E3-001: Deterministic Option Generator Service

- Objective: produce stable ordered options from role, evidence, risk, merge state, and policy ambiguity.
- Scope: decision table implementation, stable sorter, option prerequisites metadata.
- Non-goals: AI-generated option ranking.
- Acceptance criteria:
  1. Identical inputs MUST produce identical ordered options lists.
  2. Inspection-only options MUST be clearly separated from state-changing options.
  3. State-changing options MUST include prerequisite and evidence requirement metadata.
  4. `ASK_CLARIFY` MUST create `awaiting_clarification` blocking state contract.
- Verification: decision-table snapshot tests and contract tests.
- Deliverables: option service module, decision table fixtures, API contract docs.

### GCC-E3-002: Agent Battle Terminal Shell and Keyboard Model

- Objective: implement battle terminal interaction shell for operator actions.
- Scope: arena panel, command input line with `Ctrl+Enter`, deterministic focus/hotkeys.
- Non-goals: full log streaming backend.
- Acceptance criteria:
  1. Arena MUST display current `agent_request` or bead goal.
  2. Input MUST support multiline editing and explicit send shortcut (`Ctrl+Enter`).
  3. State-changing actions MUST show command preview before submit.
  4. Keyboard-only navigation MUST be complete across canonical options.
- Verification: accessibility keyboard tests and UI flow tests.
- Deliverables: terminal shell UI, hotkey map, accessibility labels/tests.

### GCC-E3-003: Proof River Streaming Cards with Correlation Links

- Objective: present auditable real-time execution timeline with deep links.
- Scope: streaming timeline panel, tool-call cards, correlation/causation display, inline deep links.
- Non-goals: provider-native artifact viewer internals.
- Acceptance criteria:
  1. Timeline entries MUST show timestamp, event type, and correlation identifiers.
  2. Tool-call cards MUST display inputs/outputs references and artifact links.
  3. Inline diff entries MUST link to commit and PR entities.
  4. Timeline filters MUST operate deterministically by event category and entity scope.
- Verification: event-stream rendering tests and deep-link integration tests.
- Deliverables: proof-river components, filter model, timeline integration tests.

### GCC-E3-004: Meter Derivation and Provenance Panels

- Objective: implement explicit formulas and provenance links for progress/tests/risk/confidence/tokens.
- Scope: meter computation service, provenance references, meter detail panel.
- Non-goals: hidden heuristic scores.
- Acceptance criteria:
  1. Progress, tests, risk, confidence, and token/cost metrics MUST follow PRD formulas.
  2. Risk score MUST include rule IDs used in computation.
  3. Confidence MUST use explicit signals only and expose contributing factors.
  4. Every meter MUST provide provenance links to supporting artifacts/events.
- Verification: formula unit tests and provenance panel tests.
- Deliverables: meter compute module, provenance schema, meter UI tests.

### GCC-E3-005: Mayor Dangerous Action Confirmation and Ledger Capture

- Objective: enforce high-risk action confirmation with evidence visibility capture.
- Scope: mayor confirmation modal, missing-evidence listing, blast-radius preview, audit payload.
- Non-goals: incident policy authoring.
- Acceptance criteria:
  1. Dangerous actions MUST require explicit confirmation before command emit.
  2. Modal MUST list viewed evidence, missing evidence, implicated policy clauses, expected blast radius.
  3. Confirmed actions MUST emit immutable audit entry capturing what was seen at decision time.
  4. Non-Mayor roles MUST be denied access to dangerous action confirmation path.
- Verification: RBAC integration tests and audit payload contract tests.
- Deliverables: confirmation flow UI, command handler updates, audit contract tests.

---

## GCC-E4 Tickets

### GCC-E4-001: Provider Adapter Contract and Normalization Layer

- Objective: normalize provider signals into deterministic internal contracts.
- Scope: adapter interface definitions (`observe_push`, `observe_pr`, `observe_check_run`, `read_diff_artifact`, `read_conflict_artifact`, `enqueue_merge`, `dequeue_merge`), base adapter implementation.
- Non-goals: support for all providers in v1.
- Acceptance criteria:
  1. Adapter outputs MUST include normalized IDs and raw provider links.
  2. Contract tests MUST validate adapter output schema for push/PR/check/conflict paths.
  3. Failure states MUST map to deterministic internal error codes.
  4. At least one provider adapter MUST pass full contract suite.
- Verification: adapter contract test suite.
- Deliverables: adapter interfaces, one concrete adapter, contract fixtures.

### GCC-E4-002: Merge Lane State Machine and Deterministic Gate Evaluator

- Objective: compute merge eligibility from policy + CI + repo truth with deterministic reasons.
- Scope: lane state machine, gate evaluator, reason code taxonomy.
- Non-goals: manual override workflow.
- Acceptance criteria:
  1. Gate states MUST resolve to `GREEN`, `YELLOW`, or `RED` using deterministic rules.
  2. Evaluator MUST emit reason codes with linked policy/check evidence refs.
  3. High-risk or ambiguous policy states MUST require signoff flags.
  4. Evaluator behavior MUST be reproducible from persisted inputs.
- Verification: evaluator table tests and replay tests.
- Deliverables: state machine module, evaluator engine, reason-code catalog.

### GCC-E4-003: Highway Merge Traffic UI with Lane Clustering

- Objective: visualize merge queues at scale while preserving individual PR drill-down.
- Scope: lane rendering, clustering/stacking logic, detail panel linking.
- Non-goals: animation-rich visual polish.
- Acceptance criteria:
  1. Lane view MUST display gate state, reason codes, and queue ordering.
  2. Clusters MUST preserve access to individual PR/check evidence links.
  3. Lane updates MUST reflect evaluator state changes in real time.
  4. Conflict indicators MUST surface explicit entry points to encounter workflow.
- Verification: UI integration tests with synthetic queue datasets.
- Deliverables: highway UI module, cluster strategy, rendering tests.

### GCC-E4-004: Conflict Encounter Resolution Command Flows

- Objective: implement deterministic conflict resolution paths.
- Scope: `AUTO_RESOLVE`, `OPEN_CONFLICT_FILES`, `ASK_AGENT`, `ABORT_MERGE` commands and guardrails.
- Non-goals: automatic semantic conflict resolution.
- Acceptance criteria:
  1. `AUTO_RESOLVE` MUST execute only when policy allows and evidence capture requirements are met.
  2. `ASK_AGENT` MUST create blocking lane state until resolver event occurs.
  3. `ABORT_MERGE` MUST emit command + audit and update lane state deterministically.
  4. Conflict file lists MUST be linked as evidence artifacts.
- Verification: command flow tests and lane transition tests.
- Deliverables: conflict command handlers, state transitions, evidence linking tests.

### GCC-E4-005: Rework Ticket Generation and Lane Block/Unblock Rules

- Objective: enforce explicit rework loops on failed checks/conflicts.
- Scope: rework artifact generation, required actions list, block/unblock lane policy.
- Non-goals: general-purpose issue tracker replacement.
- Acceptance criteria:
  1. Failed checks/conflicts MUST create actionable rework entries with evidence links and next steps.
  2. Lane MUST remain blocked until required actions are resolved per policy.
  3. Rework resolution events MUST unblock lane deterministically when criteria pass.
  4. Rework state MUST be visible from Highway and Building Interior views.
- Verification: workflow tests for fail->rework->resolve->unblock lifecycle.
- Deliverables: rework generator, lane gate hooks, integration tests.

### GCC-E4-006: Gate Reconciliation Job and Incident Emission

- Objective: detect drift between computed gates and observed provider state.
- Scope: periodic reconciliation job, discrepancy detector, incident event emission.
- Non-goals: long-term anomaly analytics.
- Acceptance criteria:
  1. Reconciliation job MUST compare deterministic evaluator output with provider-observed gate truth.
  2. Discrepancies MUST emit incident events with evidence refs and reason codes.
  3. Job outputs MUST include correlation IDs for drill-down and replay.
  4. False-positive suppression rules MUST be explicit and test-covered.
- Verification: reconciliation simulation tests.
- Deliverables: reconciliation worker, incident emitter, simulation test suite.

---

## GCC-E5 Tickets

### GCC-E5-001: City Hall Global Queue with Deterministic Ordering

- Objective: provide mayor/admin global operations queue with reproducible ordering.
- Scope: approvals/incidents/escalations/merge-blockers queue model and UI.
- Non-goals: long-form analytics reporting.
- Acceptance criteria:
  1. Queue ordering MUST be deterministic and documented.
  2. Queue entries MUST expose evidence links and derivation reason codes.
  3. Queue filters MUST support role-relevant triage paths.
  4. Queue actions MUST respect RBAC and audit requirements.
- Verification: queue ordering tests and command auth tests.
- Deliverables: City Hall queue UI/service, ordering tests, docs.

### GCC-E5-002: Policy Control Plane Versioning and Effective Times

- Objective: implement policy change management as immutable events.
- Scope: policy version model, effective-at scheduling, rollback-by-new-version flow.
- Non-goals: custom policy language parser redesign.
- Acceptance criteria:
  1. Policy changes MUST be represented as immutable events with version IDs.
  2. Effective-at timestamps MUST control gate evaluator inputs deterministically.
  3. Policy history MUST be replayable and inspectable with deep links.
  4. Dangerous policy changes MUST route through mayor confirmation capture.
- Verification: policy version transition tests and replay tests.
- Deliverables: policy event handlers, version index, policy history views.

### GCC-E5-003: Incident Controls with Scope, Expiry, and Replayable History

- Objective: enable incident declaration, scope control, expiry, and immutable history.
- Scope: incident lifecycle commands, scoped impact model, expiry scheduler, history views.
- Non-goals: external incident-management integration.
- Acceptance criteria:
  1. Incident create/update/expire actions MUST emit immutable incident events and audit entries.
  2. Incident scope MUST be explicit (`tenant`, `project`, `lane`, or `agent` scope types).
  3. Expiry MUST auto-transition incident state when conditions are met.
  4. Incident history MUST remain replayable with stable deep links.
- Verification: incident lifecycle integration tests.
- Deliverables: incident command handlers, expiry worker, history UI/tests.

### GCC-E5-004: Coordination Detector with Evidence-Linked Remediation

- Objective: detect cross-project coordination risks and suggest role-gated remediation commands.
- Scope: heuristic detector engine, detection cards, remediation action wiring.
- Non-goals: probabilistic black-box scoring.
- Acceptance criteria:
  1. Each detection MUST include heuristic ID, evidence links, and remediation options.
  2. Remediation commands MUST be role-gated and auditable.
  3. Detector outputs MUST be reproducible for same event window and policy inputs.
  4. Suppression or dismissal actions MUST preserve audit history.
- Verification: heuristic fixture tests and remediation auth tests.
- Deliverables: detector module, UI cards, remediation handlers.

### GCC-E5-005: Offline Replay Mode and Reconnect Recovery

- Objective: provide stale-aware read-only operation during disconnects.
- Scope: offline state banner, stale indicators, reconnect cursor replay, snapshot refresh on overflow.
- Non-goals: offline command queueing for mutating actions.
- Acceptance criteria:
  1. Disconnect MUST switch UI to explicit read-only replay mode with stale markers.
  2. Mutating actions MUST be blocked while disconnected.
  3. Reconnect MUST resume from cursor and request snapshot refresh on overflow.
  4. User MUST see explicit recovery status and last synchronized cursor.
- Verification: end-to-end disconnect/reconnect tests.
- Deliverables: offline state manager, reconnect workflow, e2e tests.

### GCC-E5-006: Acceptance Harness and SLO/Audit/Replay Dashboards

- Objective: prove PRD acceptance targets via automated validation and telemetry dashboards.
- Scope: load harness, latency probes, audit coverage checker, replay parity checker, accessibility gate.
- Non-goals: business KPI dashboards outside PRD acceptance.
- Acceptance criteria:
  1. Harness MUST simulate 100 live updating projects and 200+ searchable projects.
  2. Telemetry MUST report typical/P95/P99 latencies for important events.
  3. Automated checks MUST assert 100% audit coverage for commands/approvals/acks.
  4. Replay parity tests MUST pass within defined eventual-consistency bounds.
  5. Accessibility gate MUST include keyboard and screen reader checks for critical flows.
- Verification: CI acceptance pipeline and dashboard snapshots.
- Deliverables: acceptance test suite, load scripts, dashboard definitions, runbook.

