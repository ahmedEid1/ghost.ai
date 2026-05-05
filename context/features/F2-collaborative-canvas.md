Consolidated spec for Feature 2 — Real-time Collaborative Canvas.
Covers the work documented in feature-specs 10 through 17, 21, and 21.5.

## What This Feature Delivers

A fully synced multi-user canvas built on React Flow and Liveblocks, with rich node/edge editing, keyboard ergonomics, and durable autosave.

### Liveblocks Room

- `POST /api/liveblocks-auth` provisions the room via `getOrCreateRoom`, validates Clerk auth, checks project access, and issues an ID token.
- `liveblocks.config.ts` typed with `Presence` (`cursor`, `thinking`) and `UserMeta` (`id`, `info.displayName`, `info.avatarUrl`, `info.cursorColor`).
- `useLiveblocksFlow` wires synced `nodes`/`edges` and all change handlers into `<ReactFlow>`.

### Shape Panel & Node Visuals

- Floating bottom-center pill toolbar with six draggable shapes (rectangle, diamond, circle, pill, cylinder, hexagon).
- Custom drag ghost rendered via `createPortal`; native browser ghost suppressed.
- Per-shape `ShapeBody` renderers: CSS div for rectangle/pill/circle, SVG polygon for diamond/hexagon, composed SVG for cylinder.
- `NodeResizer` with per-shape minimum dimensions; resize handles styled for the dark canvas.
- Double-click inline label editing with auto-growing textarea, IME guard, Escape rollback, and real-time sync via `updateNodeData`.
- Floating color toolbar above the selected node; 8-color palette from `NODE_COLORS`; writes through Liveblocks.

### Edge Behavior

- Three routing modes: elbow (`getSmoothStepPath`), bezier (`getBezierPath`), straight (`getStraightPath`).
- Per-edge SVG markers for start/end arrows; stroke weight, dash style, and 9-color palette.
- Draggable midpoint handle for elbow routing; draggable label pill with reset button.
- `EdgeStyleToolbar` floats above the selected edge; all updates go through `setEdges` for collaborative sync.
- `reconnectable: true`; reconnect dispatches a remove+add edge change pair to preserve edge data.

### Ergonomics & Deletion

- Keyboard shortcuts: zoom in/out, `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z`/Y redo, Delete/Backspace deletion.
- `CanvasControls` pill bar: zoom out / fit / zoom in / undo / redo with Liveblocks `useCanUndo`/`useCanRedo` disabled state.
- Windows-style marquee multi-select (`SelectionMode.Partial`); `deleteKeyCode={null}` so the keyboard hook owns deletion.
- Right-click context menu with cascading edge removal (connected edges deleted with their nodes).

### Autosave & Restore

- `hooks/use-canvas-autosave.ts`: 1200ms debounce, content-hash dedup (sort nodes/edges by ID before serializing).
- `PUT /api/projects/[projectId]/canvas` uploads to Vercel Blob and updates `Project.canvasJsonPath` in Prisma.
- `GET /api/projects/[projectId]/canvas` restores on mount only if the room is empty (never overwrites active collaboration).
- `SaveIndicator` in `CanvasControls`: Cloud / CloudOff / Loader2, hidden in idle state.

## Key Files

- `components/editor/canvas.tsx` — room provider, flow wiring, autosave, presence, event routing
- `components/editor/canvas-node.tsx` — node renderer, resizer, label editing, color toolbar
- `components/editor/node-shapes.tsx` — per-shape visual renderers
- `components/editor/canvas-edge.tsx` — edge renderer, style toolbar, midpoint handle
- `components/editor/shape-panel.tsx` — drag-and-drop shape toolbar
- `components/editor/canvas-controls.tsx` — zoom / undo / save indicator
- `hooks/use-canvas-autosave.ts` — debounced save with hash dedup
- `hooks/use-keyboard-shortcuts.ts` — keyboard bindings
- `lib/canvas-storage.ts` — blob helpers
- `app/api/liveblocks-auth/route.ts` — room auth
- `app/api/projects/[projectId]/canvas/route.ts` — save / restore

## Detailed Specs

See `context/feature-specs/`: 10, 11, 12, 13, 14, 15, 16, 17, 21, 21.5

## Check When Done

- Multiple users open the same project and see each other's edits in real time.
- Drag-and-drop places a shape; resize handles and inline label editing work per shape.
- Color toolbar updates node fill for all participants.
- Edge style toolbar changes routing, weight, dash, arrows, and color collaboratively.
- Undo/redo works across participants.
- Delete key and right-click context menu remove selected items with cascading edge cleanup.
- Canvas restores on fresh open; save indicator reflects upload state.
- `npm run build` passes.
