Consolidated spec for Feature 6 — Spec Generation.
Covers the work documented in feature-specs 27, 28, and 29.

## What This Feature Delivers

A one-click flow that reads the live canvas, calls Claude to write a Markdown technical specification, persists it to Vercel Blob, and makes it viewable and downloadable from the sidebar.

### API Layer

- `POST /api/ai/spec` — validates Clerk auth, resolves project access from `roomId` (never trusts client-supplied `projectId`), validates `roomId`/`nodes`/`edges`/`chatHistory`, triggers the `generate-spec` Trigger.dev task, creates a `TaskRun` record, returns `runId`.
- `POST /api/ai/spec/token` — verifies `TaskRun` ownership, issues a Trigger.dev public token scoped to the run with 1-hour expiry.
- `GET /api/projects/[projectId]/specs` — lists all specs sorted by `createdAt` desc (auth + access guard), returns `{id, createdAt}` array.
- `GET /api/projects/[projectId]/specs/[specId]` — serves raw Markdown content from Vercel Blob (auth + access + 404 guards).
- `GET /api/projects/[projectId]/specs/[specId]/download` — streams the blob as `Content-Disposition: attachment` with `text/markdown`; verifies `Spec.projectId` matches the route param to prevent cross-project access.

### Trigger.dev Task

- `trigger/generate-spec.ts` — `schemaTask` with Zod validation accepting `projectId`, `roomId`, `chatHistory`, `nodes`, and `edges`.
- Builds a readable canvas summary (node labels/shapes + edge source→target pairs).
- Appends `chatHistory` as design context for Claude.
- Calls Claude (claude-sonnet-4-6) via `@ai-sdk/anthropic`; updates run `metadata` status at each phase (`reading-canvas` → `generating` → `saving`).
- Uploads generated Markdown to Vercel Blob at `specs/{projectId}/{specId}.md` (private, `text/markdown`) using a `crypto.randomUUID()` spec ID.
- Creates a `Spec` Prisma record (`id`, `projectId`, `filePath`).
- Returns `{ content, wordCount, specId }`.

### Prisma Schema

- `Spec` model: `id` (cuid), `projectId` (FK cascade delete), `filePath` (Vercel Blob URL), `createdAt`.

### Specs Tab

- `SpecsTab` accepts `projectId` and `getCanvasSnapshot` (ref-based snapshot getter registered by `CanvasFlow` via `onCanvasReady`).
- "Generate Spec" button reads live canvas nodes/edges via snapshot, POSTs to `/api/ai/spec`, fetches a public token, mounts an invisible `RunTracker` using `useRealtimeRun`.
- `useFeedMessages("ai-chat")` provides chat history context sent with the spec payload.
- `RunTracker` fires `onComplete` on terminal status; tab auto-refreshes the spec list on success.
- Spec list is scrollable: filename, date, and per-item download button.
- Clicking a spec card opens a `Dialog` that fetches and renders the Markdown via `react-markdown` with token-based styling; download button in the modal header.

## Key Files

- `trigger/generate-spec.ts` — Trigger.dev schemaTask with Claude and Vercel Blob upload
- `app/api/ai/spec/route.ts` — trigger endpoint
- `app/api/ai/spec/token/route.ts` — token endpoint
- `app/api/projects/[projectId]/specs/route.ts` — list endpoint
- `app/api/projects/[projectId]/specs/[specId]/route.ts` — content endpoint
- `app/api/projects/[projectId]/specs/[specId]/download/route.ts` — secure download
- `components/editor/specs-tab.tsx` — generate button, RunTracker, spec list, preview dialog
- `prisma/schema.prisma` — Spec model

## Detailed Specs

See `context/feature-specs/`: 27, 28, 29

## Check When Done

- "Generate Spec" reads the live canvas and triggers the background task.
- Phase progress updates in the tab while the task runs.
- Completed spec appears in the list with correct filename and date.
- Clicking a spec opens the Markdown preview dialog.
- Download button streams the file with `Content-Disposition: attachment`.
- A collaborator (non-owner) can view and download specs for shared projects.
- A user cannot download specs from a project they have no access to (403).
- `npm run build` passes.
