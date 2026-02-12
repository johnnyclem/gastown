# Gastown Command Center Execution Plan (Initial)

Source artifacts:
- Epics: `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/docs/implementation/EPICS.md`
- Tickets: `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/docs/implementation/TICKETS.md`

## Goals

- Sequence implementation to minimize rework and unblock downstream UI and policy features early.
- Protect deterministic contracts first (events, replay, RBAC, deep links, gate logic).
- Tie each execution wave to explicit acceptance evidence.

## Recommended Pull Order

### Wave 0: Contract Foundation

1. `GCC-E1-001` Canonical Event Envelope and Schema Registry
2. `GCC-E1-002` Append-Only Event Store and Immutable Audit Ledger
3. `GCC-E1-004` Tenant Identity Model and RBAC Authorization Guards
4. `GCC-E1-005` Evidence Deep-Link Router and Resolver
5. `GCC-E1-003` Snapshot+Cursor Replay API with WS/SSE Contract
6. `GCC-E1-006` CI Lints for Normative Language and Metaphor Drift

Wave acceptance gate:
- Replay tests pass.
- RBAC matrix deny-by-default enforced.
- Mutating command->audit pairing coverage at 100% for implemented command paths.

### Wave 1: Core Projection and Global Surfaces

1. `GCC-E2-001` Deterministic Projection Model for Town and Building Status
2. `GCC-E2-002` Town Map Canvas with LOD and Evidence Entry Points
3. `GCC-E2-003` Search and Filter Grammar with Stable Ranking
4. `GCC-E2-004` Town Crier Alerts with Ack vs Snooze Semantics
5. `GCC-E2-005` Building Interior Room Lifecycle and Artifact Hotspots

Wave acceptance gate:
- Town and building summary states drill down to evidence links.
- Ack commands are audited; snooze remains local.

### Wave 2: Action Surfaces and Option Determinism

1. `GCC-E3-001` Deterministic Option Generator Service
2. `GCC-E3-002` Agent Battle Terminal Shell and Keyboard Model
3. `GCC-E3-003` Proof River Streaming Cards with Correlation Links
4. `GCC-E3-004` Meter Derivation and Provenance Panels
5. `GCC-E3-005` Mayor Dangerous Action Confirmation and Ledger Capture

Wave acceptance gate:
- Option ordering reproducible for identical inputs.
- Dangerous action flow captures what-was-seen evidence references.

### Wave 3: Merge Logistics and Conflict Control

1. `GCC-E4-001` Provider Adapter Contract and Normalization Layer
2. `GCC-E4-002` Merge Lane State Machine and Deterministic Gate Evaluator
3. `GCC-E4-004` Conflict Encounter Resolution Command Flows
4. `GCC-E4-005` Rework Ticket Generation and Lane Block/Unblock Rules
5. `GCC-E4-003` Highway Merge Traffic UI with Lane Clustering
6. `GCC-E4-006` Gate Reconciliation Job and Incident Emission

Wave acceptance gate:
- Merge eligibility fully deterministic from policy + CI + repo state.
- Failures create rework and block advancement until resolution.

### Wave 4: Governance and Production Hardening

1. `GCC-E5-001` City Hall Global Queue with Deterministic Ordering
2. `GCC-E5-002` Policy Control Plane Versioning and Effective Times
3. `GCC-E5-003` Incident Controls with Scope, Expiry, and Replayable History
4. `GCC-E5-005` Offline Replay Mode and Reconnect Recovery
5. `GCC-E5-004` Coordination Detector with Evidence-Linked Remediation
6. `GCC-E5-006` Acceptance Harness and SLO/Audit/Replay Dashboards

Wave acceptance gate:
- SLO dashboards and acceptance harness prove PRD acceptance criteria.
- Accessibility and replay parity gates pass.

## Critical Path Tickets

These tickets SHOULD be treated as blocking for broad parallelization:

1. `GCC-E1-001`
2. `GCC-E1-002`
3. `GCC-E1-004`
4. `GCC-E1-003`
5. `GCC-E2-001`
6. `GCC-E3-001`
7. `GCC-E4-002`
8. `GCC-E5-006`

## Staffing Model (Suggested)

- Lane A (Platform): E1 core, replay, RBAC, audit, adapters, gate evaluator
- Lane B (UX): E2 map/interior, E3 terminal/proof river, E4 highway UI
- Lane C (Governance + QA): E5 city hall, incidents, acceptance harness, accessibility/perf

## Risk Watchlist

- Hidden non-determinism in reducers/options/gates
- Provider API inconsistencies causing mapping drift
- Late performance validation against 100 live projects
- Ambiguous policy DSL impacting gate computation and signoff paths

## Weekly Planning Cadence (Suggested)

- Monday: pull next ready tickets on critical path
- Wednesday: replay/audit determinism checkpoint
- Friday: wave acceptance gate review with evidence snapshots

