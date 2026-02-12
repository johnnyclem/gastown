# Linear Ticket Import Guide

Prepared artifacts:
- `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/docs/implementation/LINEAR_IMPORT.csv`
- `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/docs/implementation/LINEAR_IMPORT.json`

Ticket count: 28

## CSV Fields Included

- `Title`
- `Description`
- `Priority`
- `Labels`
- `Project`
- `Estimate`
- `TicketID`
- `Epic`
- `Dependencies`
- `PriorityBucket`
- `EstimateDays`

## Priority Mapping Used

- `P0` -> `1`
- `P1` -> `2`
- `P2` -> `3`

## Import Steps (UI)

1. Open Linear workspace import flow for CSV issues.
2. Upload `LINEAR_IMPORT.csv`.
3. Map at least these fields:
   - `Title` -> Issue title
   - `Description` -> Issue description
   - `Priority` -> Priority (or skip and map manually)
   - `Labels` -> Labels
   - `Project` -> Project
4. If your workspace requires team selection, apply the target team during import.
5. Complete import and verify issue count is 28.

## Notes

- `TicketID`, `Epic`, and `Dependencies` are included as import metadata so linkage can be reconstructed post-import.
- The descriptions embed objective, scope, non-goals, acceptance criteria, verification, and deliverables from:
  `/Users/johnnyclem/Desktop/OpenCode_Repos/EarthboundGastown/docs/implementation/TICKETS.md`

## MCP Status

Linear MCP server has been added in this Codex environment but is not yet authenticated.

- Add status check: `codex mcp list`
- Authenticate: `codex mcp login linear`

After login, restart Codex and I can create/update issues directly via MCP instead of CSV import.

