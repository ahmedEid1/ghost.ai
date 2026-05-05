Consolidated spec for Feature 4 — Starter Templates.
Covers the work documented in feature-specs 18.

## What This Feature Delivers

A curated library of prebuilt system architectures that any collaborator can import into the active canvas with a single click.

- `CANVAS_TEMPLATES` array with three templates: Microservices Platform, CI/CD Pipeline, Event-Driven System.
- Each template uses stable node IDs, canonical `NODE_COLORS`, supported `NODE_SHAPES`, and `CanvasEdgeData`-compatible edges.
- `StarterTemplatesModal` renders a `Dialog` with a scrollable 3-column card grid.
- Each card shows a lightweight SVG diagram preview: bounds-calculated scale and offset projection, shape-accurate node rendering, and edge lines.
- Node and edge count metadata displayed under each preview.
- "Use template" import button batch-replaces all nodes and edges through the Liveblocks-synced `onNodesChange`/`onEdgesChange` handlers, then calls `fitView` after 60ms.
- Import is fully undoable via Liveblocks undo/redo.
- `WorkspaceNavbar` exposes a `LayoutTemplate` icon button that opens the modal.
- `WorkspaceShell` owns modal open state and a `useRef` to the canvas import function registered at mount via `onImportReady`.

## Key Files

- `components/editor/starter-templates.ts` — template data and types
- `components/editor/starter-templates-modal.tsx` — modal UI with SVG previews and import action
- `components/editor/canvas.tsx` — `onImportReady` prop registration
- `components/editor/workspace-shell.tsx` — modal state and import ref
- `components/editor/workspace-navbar.tsx` — LayoutTemplate icon button

## Detailed Specs

See `context/feature-specs/`: 18

## Check When Done

- Clicking the LayoutTemplate button opens the template modal.
- Each card renders a recognizable SVG preview of the architecture.
- "Use template" replaces the canvas contents and fits the view.
- The import is undoable with `Ctrl/Cmd+Z`.
- Two collaborators opening the modal and importing see the same result.
- `npm run build` passes.
