# Feature 21 - Canvas Autosave and Restore

Add reliable autosave and restore for collaborative canvas state so project diagrams persist outside transient room memory and are available before AI generation/spec workflows depend on them.

## Goal

Persist canvas graph data to blob storage while keeping relational metadata in Prisma.

This feature introduces:

1. Server routes for saving and loading canvas JSON.
2. Client autosave with debounced writes and status feedback.
3. Safe initial restore logic that never overwrites active collaboration.

## Dependencies and Existing Contracts

- Canvas state is synchronized in-room through Liveblocks + React Flow.
- Project metadata is stored in Prisma.
- Architecture requires generated artifacts (including canvas snapshots) in Vercel Blob.
- Existing project model already includes metadata field for canvas blob URL (`canvasJsonPath`). Reuse it.
- Access control helpers already enforce project membership.

Do not change node/edge contracts, room auth issuance, template import behavior, or AI workflow in this unit.

## Storage Model

- Prisma: stores project metadata and blob URL reference only.
- Vercel Blob: stores serialized canvas artifact JSON.

Canonical blob path pattern:

- `canvas/{projectId}.json`

## What to Install

- `@vercel/blob`

## API Contract

### 1) Save Route

Create/extend route:

- `PUT /api/projects/[projectId]/canvas`

Request body:

```ts
interface SaveCanvasRequest {
   nodes: unknown[];
   edges: unknown[];
   version?: number;
   savedAt?: string;
}
```

Behavior:

1. Validate authenticated user.
2. Validate user has project access (owner or collaborator).
3. Validate payload shape before upload.
4. Upload JSON to Vercel Blob at canonical canvas path.
5. Update Prisma `Project.canvasJsonPath` with returned blob URL.
6. Return consistent success shape including URL and timestamp.

Response shape (example):

```ts
{
   ok: true,
   canvasUrl: string,
   savedAt: string,
}
```

### 2) Load Route

Create/extend route:

- `GET /api/projects/[projectId]/canvas`

Behavior:

1. Validate authenticated user.
2. Validate user has project access.
3. Read `Project.canvasJsonPath` from Prisma.
4. If no URL exists, return `hasSavedCanvas: false`.
5. If URL exists, fetch blob JSON and return normalized canvas payload.

Response shape (example):

```ts
{
   ok: true,
   hasSavedCanvas: boolean,
   canvas: {
      nodes: unknown[];
      edges: unknown[];
   } | null,
   canvasUrl: string | null,
}
```

Error behavior:

- `401` unauthenticated.
- `403` authenticated but no access.
- `400` invalid payload (PUT).
- `500` unexpected failures with server logging.

## Client Autosave

### 1) Hook

Add a dedicated hook in `hooks/`:

- `use-canvas-autosave.ts`

Responsibilities:

- Observe Liveblocks-synced nodes and edges.
- Debounce writes to reduce blob/API churn.
- Save through `PUT /api/projects/[projectId]/canvas`.
- Expose save status for UI.

Suggested status union:

```ts
type SaveStatus = "idle" | "saving" | "saved" | "error";
```

Debounce expectations:

- Trigger save only after a quiet window (for example 800-1500ms).
- Cancel pending save on rapid successive edits.
- Avoid duplicate uploads when serialized graph has not changed.

### 2) Save Triggering Rules

- Save on graph changes (nodes/edges).
- Do not save while initial restore is still applying.
- Do not issue autosave for empty no-op state repeatedly.
- Allow retry on next graph change after failure.

## Initial Restore Logic

Restore only when safe.

Requirements:

1. On canvas load, check current room graph.
2. If room already has any nodes or edges, skip restore entirely.
3. If room is empty, call `GET /api/projects/[projectId]/canvas`.
4. If saved canvas exists, hydrate room graph from saved payload.
5. Hydration must happen through existing Liveblocks-compatible graph update flow.

Important:

- Never overwrite active collaboration state.
- Never merge saved graph into non-empty room in this feature.
- Do not bypass current graph setter abstractions.

## Save Status Indicator

Add lightweight status feedback near the existing editor save affordance.

States:

- `saving`: in-flight write.
- `saved`: last write succeeded.
- `error`: last write failed.

UX behavior:

- Keep indicator compact and non-disruptive.
- Use existing token-based colors/text styles.
- Do not block editing while saving.

## Security and Validation

- Enforce project access at both save and load routes.
- Validate body shape before blob upload.
- Treat blob URL and returned JSON as untrusted input.
- Keep route handlers thin and push reusable logic into `lib/` utilities if needed.

## Scope Limits

- Do not add AI generation logic.
- Do not add spec generation logic.
- Do not add background tasks for autosave.
- Do not add version history or snapshot browsing UI.
- Do not add conflict resolution beyond "skip restore when room non-empty".
- Do not move canvas JSON into PostgreSQL.

## Accessibility Requirements

- Save status text/icon must maintain contrast in dark UI.
- Status indicator should be perceivable without relying on color alone.
- Any status icon-only control must include `aria-label`.

## Edge Cases

- Network error during autosave sets status to `error` and recovers on next change.
- Blob URL exists but blob fetch fails: return safe error and do not corrupt room state.
- Empty saved payload should not crash hydration.
- Rapid drag/move edits should debounce into fewer save requests.
- Opening same project in another tab should not force overwrite because restore only runs on empty room.

## Implementation Plan

1. Install and configure `@vercel/blob` usage in server routes.
2. Reuse `Project.canvasJsonPath` as blob URL reference field.
3. Implement `PUT` and `GET` canvas routes with auth/access validation.
4. Add `use-canvas-autosave` with debounced save and status state.
5. Wire restore-on-empty behavior in canvas initialization flow.
6. Surface save status in editor Save UI.
7. Run `npm run build`.

## Check When Done

- `@vercel/blob` is installed.
- Project metadata stores canvas blob URL via `canvasJsonPath`.
- Save/load routes use Prisma for metadata and Vercel Blob for artifact JSON.
- Autosave is debounced and status-aware.
- Save status is visible in editor UI.
- Saved canvas restore is skipped when room already contains nodes or edges.
- `npm run build` passes.

## Acceptance Criteria

- Editing the canvas produces debounced autosaves to blob storage.
- Returning to an empty room restores the latest saved canvas.
- Active collaborative rooms are never overwritten by saved data.
- Users receive clear save feedback (saving/saved/error).
- The implementation preserves architecture boundaries between relational metadata and blob artifacts.