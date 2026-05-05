Consolidated spec for Feature 5 — AI Architecture Generation.
Covers the work documented in feature-specs 20, 22, 23, 24, 25.5, and 26.

## What This Feature Delivers

A user types a natural-language prompt in the AI sidebar. A durable background task calls Claude, generates a validated plan of canvas mutations, and writes nodes and edges directly into the live Liveblocks room. Every collaborator sees the design appear in real time while a status strip and Ghost AI presence track progress.

### API Layer

- `POST /api/ai/design` — validates Clerk auth + project access, trims prompt (4000-char cap), triggers the `design-agent` Trigger.dev task, creates a `TaskRun` Prisma record, returns `runId`.
- `POST /api/ai/design/token` — verifies `TaskRun` ownership, issues a run-scoped Trigger.dev public token (read-only, scoped to the run).

### Trigger.dev Task

- `trigger/design-agent.ts` — `schemaTask` with Zod payload validation (`prompt`, `roomId`, `nodes`, `edges`).
- Calls Claude (claude-sonnet-4-6) via `@ai-sdk/anthropic` with `generateObject` and `AgentPlanSchema`.
- `AgentPlanSchema` covers 8 action types: `add_node`, `move_node`, `resize_node`, `update_node`, `delete_node`, `add_edge`, `delete_edge`, `update_edge`.
- Each action is validated and normalized before mutation; invalid or out-of-range values are discarded.
- Canvas mutations written via `mutateFlow()` from `@liveblocks/react-flow/node` — all participants see changes appear live.
- Ghost AI collaborator presence set via `liveblocks.setPresence()` with cursor positioned near active nodes and `thinking: true` while running; cleaned up in a `finally` block.
- Room-wide `AI_STATUS` events broadcast at each phase via `liveblocks.broadcastEvent()`.
- Trigger `metadata` updated at each phase for the realtime run subscriber.

### Status & Presence (Frontend)

- `types/ai-status.ts` — `parseAiStatusEvent` validates incoming `AI_STATUS` room events before they reach UI state.
- `hooks/use-ai-activity-state.ts` — derives `isActive`, `phase`, `message`, `activeRunId`, `latestStatus` with leading-run replacement logic.
- `WorkspaceShell` routes validated events through `useAiActivityState` and passes `AiActivityState` down to `AiSidebar`.
- Ghost AI bot avatar in `PresenceCluster` shows an animated thinking ring while `isActive`.
- Ghost AI cursor in `LiveCursorLayer` shows a dashed spinner badge while `thinking`.

### AI Architect Tab

- `AiArchitectTab` — auto-resizing textarea composer (Enter submits, Shift+Enter newline, IME guard).
- On submit: POST to `/api/ai/design`, fetch token from `/api/ai/design/token`, mount `RunTracker`.
- `RunTracker` — invisible child using `useRealtimeRun` from `@trigger.dev/react-hooks` to subscribe to the run; fires `onComplete(succeeded)` on terminal status.
- `StatusStrip` — compact phase label bar shown above the composer only while a run is active.
- User prompt posted to the `ai-chat` Liveblocks feed on submit; Ghost AI reply posted on run completion.
- Composer disabled while either a local fetch or a shared run (from `aiActivity`) is active.

## Key Files

- `trigger/design-agent.ts` — Trigger.dev schemaTask with Claude and Liveblocks mutations
- `app/api/ai/design/route.ts` — trigger endpoint
- `app/api/ai/design/token/route.ts` — token endpoint
- `components/editor/ai-architect-tab.tsx` — chat composer, RunTracker, StatusStrip
- `components/editor/ai-sidebar.tsx` — sidebar shell with tab bar and Working badge
- `hooks/use-ai-activity-state.ts` — derived AI activity state
- `types/ai-status.ts` — event validator
- `liveblocks.config.ts` — `AiStatusEvent` room event type

## Detailed Specs

See `context/feature-specs/`: 20, 22, 23, 24, 25.5, 26

## Check When Done

- Submitting a prompt triggers the Trigger.dev task and returns a runId.
- Nodes and edges appear on the shared canvas as the task runs; all collaborators see them.
- Status strip shows phase labels (started → reading-canvas → planning → applying → complete).
- Ghost AI bot avatar appears in the presence cluster with the thinking ring while the task runs.
- Ghost AI cursor is visible on the canvas during mutation.
- User prompt and AI reply appear in the room chat feed.
- Composer is locked during an active run.
- `npm run build` passes.
