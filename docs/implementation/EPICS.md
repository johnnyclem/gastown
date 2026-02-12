# Gastown Command Center Implementation Epics

Source PRD: `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/PRD.md` (v0.1, 2026-02-10)
Artifact status: Draft, ticket-ready planning set

## Planning Conventions

- Priority scale: `P0` (critical path), `P1` (required for milestone acceptance), `P2` (important but deferrable)
- Estimate scale: ticket slices MUST fit 1-2 engineering days
- Determinism rule: all merge, gate, replay, and role decisions MUST be reproducible from persisted state + immutable events
- Audit rule: all state-changing actions MUST emit both `command.*` and `audit.ledger_entry`

## Epic Map

| Epic ID | Name | Milestone | Priority | Depends On | Outcome |
|---|---|---|---|---|---|
| GCC-E1 | Deterministic Core Platform | Milestone 1 | P0 | None | Immutable event/audit core, tenant model, RBAC, deep links, replay contract |
| GCC-E2 | Town Map and Building Interior | Milestone 2 | P0 | GCC-E1 | Global/project operational views with evidence drill-down |
| GCC-E3 | Battle Terminals and Option Engine | Milestone 3 | P0 | GCC-E1, GCC-E2 | Deterministic operator/mayor action surfaces for agent workflows |
| GCC-E4 | Highway Merge Logistics and Gates | Milestone 4 | P0 | GCC-E1, GCC-E3 | Deterministic merge gating, conflict loops, rework enforcement |
| GCC-E5 | City Hall Governance and Hardening | Milestone 5 | P1 | GCC-E1, GCC-E2, GCC-E3, GCC-E4 | Global governance control plane and acceptance hardening |

---

## GCC-E1: Deterministic Core Platform

### Objective
Deliver the multi-tenant, immutable, replay-safe platform contract that all UI, policy, and merge flows build on.

### In Scope
- Canonical event envelope and schema versioning policy
- Append-only event store contract and immutable audit ledger
- Snapshot + cursor replay protocol (`WebSocket` with `SSE` fallback)
- Tenant and actor model (`tenant_id`, user actors, service accounts)
- RBAC enforcement and scoped command authorization
- Canonical deep-link routing and stable ID resolution
- Documentation linting for normative language and metaphor/event naming drift

### Out of Scope
- Final visual UX polish
- Full provider-specific adapter implementations

### Entry Criteria
- PRD v0.1 approved for implementation

### Exit Criteria
- 100% of mutating commands produce paired immutable audit entries
- Replay tests show deterministic convergence from snapshot + cursor
- RBAC deny-by-default and scoped allows are enforced
- Deep links resolve consistently in live and replay modes
- CI lint blocks nonconforming spec language and metaphor drift

### Risks and Controls
- Risk: hidden non-determinism in reducers
  - Control: deterministic reducer tests over event permutations with fixed ordering rules
- Risk: cross-tenant leakage in queries
  - Control: mandatory `tenant_id` query guard tests in API and projection reads

### Linked Tickets
`GCC-E1-001` through `GCC-E1-006`

---

## GCC-E2: Town Map and Building Interior

### Objective
Deliver the global and project-level operational surfaces with deterministic status derivations and unbroken evidence drill-down.

### In Scope
- Town Map projection model and lantern derivation rules
- LOD behavior (`far`, `mid`, `near`) with deterministic visible fields
- Search/filter grammar and ranking behavior
- Town Crier alerts with ack vs snooze semantics
- Building Interior room lifecycle and archived replay visibility
- Artifact hotspots and linked evidence panels

### Out of Scope
- Advanced animation polish
- Non-critical visual theming variants

### Entry Criteria
- GCC-E1 event, identity, deep-link contracts available

### Exit Criteria
- Town Map status and meters derive only from defined projection rules
- Every summary state links to raw evidence
- Ack operations emit command + audit records; snooze remains local preference
- Building Interior room lifecycle obeys create/close/retain/archive rules and replay guarantees

### Risks and Controls
- Risk: status drift between map and interior views
  - Control: shared projection source and cross-view contract tests
- Risk: alert spam reducing operability
  - Control: dedupe/grouping keys and grouping windows validated in tests

### Linked Tickets
`GCC-E2-001` through `GCC-E2-005`

---

## GCC-E3: Battle Terminals and Option Engine

### Objective
Deliver deterministic interaction surfaces for operators and mayors, including option generation, command semantics, and evidence-linked execution.

### In Scope
- Deterministic option generator and decision table
- Agent Battle Terminal layout and keyboard-first interactions
- Proof river streaming cards with correlation/causation visibility
- Meter formulas and provenance links
- Mayor dangerous action confirmation with "what was seen" capture

### Out of Scope
- Non-canonical option sets
- Non-deterministic recommendation heuristics

### Entry Criteria
- GCC-E1 contracts and core projections available
- GCC-E2 evidence panel and deep links available

### Exit Criteria
- Same inputs always produce same ordered options list
- State-changing options surface prerequisites and evidence requirements
- Dangerous actions cannot complete without evidence/missing-evidence confirmation capture
- Keyboard-only flow works across canonical controls

### Risks and Controls
- Risk: options differ by client implementation details
  - Control: server-authoritative option generator and snapshot tests
- Risk: confidence meter seen as opaque
  - Control: provenance links mandatory and explicit formula contract

### Linked Tickets
`GCC-E3-001` through `GCC-E3-005`

---

## GCC-E4: Highway Merge Logistics and Gates

### Objective
Deliver deterministic merge queue operations, gate evaluation, and conflict/rework loops mapped to provider-native evidence.

### In Scope
- Provider adapter normalization contracts
- Merge lane state machine and gate reason code engine
- Highway lane rendering with clustering and drill-down
- Conflict encounter resolution paths and risk gates
- Rework ticket creation with lane block/unblock enforcement
- Reconciliation checks for gate-state drift and incident creation

### Out of Scope
- Replacing Git provider source-of-truth
- Arbitrary override paths without logged evidence

### Entry Criteria
- GCC-E1 immutable event contracts and audit guarantees available
- GCC-E3 command semantics available

### Exit Criteria
- Gate state is deterministic from policy + CI + repository truth
- Failed checks/conflicts always create actionable rework artifacts
- Merge advancement blocked until required rework resolution events arrive
- Reconciliation detects and surfaces discrepancies as incidents

### Risks and Controls
- Risk: provider API inconsistency across vendors
  - Control: strict adapter contract with normalized IDs and adapter contract tests
- Risk: queue starvation under heavy conflict load
  - Control: lane ordering and block/unblock invariants with simulation tests

### Linked Tickets
`GCC-E4-001` through `GCC-E4-006`

---

## GCC-E5: City Hall Governance and Hardening

### Objective
Deliver global governance controls and production-readiness verification for performance, accessibility, replay integrity, and audit completeness.

### In Scope
- City Hall global queue deterministic ordering
- Policy versioning/effective-time control plane
- Incident scope/expiry/history workflows
- Coordination issue detector and remediation commands
- Offline/reconnect replay behavior and stale signaling
- Acceptance harness for SLOs, audit completeness, replay parity, and accessibility

### Out of Scope
- Non-essential reporting dashboards not tied to acceptance criteria

### Entry Criteria
- GCC-E1 through GCC-E4 feature-complete at integration contract level

### Exit Criteria
- City Hall supports global approvals/incidents/policy changes with immutable audit trail
- Offline replay and reconnect behavior obeys cursor/snapshot overflow policy
- Dashboards and test harness prove latency, scale, replay, and audit targets
- Accessibility checks pass for critical keyboard and screen reader flows

### Risks and Controls
- Risk: acceptance testing too late to influence architecture
  - Control: introduce harness scaffolding early and run per-epic gates
- Risk: policy controls create unsafe global blast radius
  - Control: mandatory mayor confirmation with evidence and blast-radius preview

### Linked Tickets
`GCC-E5-001` through `GCC-E5-006`

## Global Critical Path

1. GCC-E1 core contracts and deterministic store/replay
2. GCC-E2 projections and evidence-linked views
3. GCC-E3 deterministic action engine
4. GCC-E4 merge logistics and reconciliation
5. GCC-E5 governance completion and hardening acceptance

