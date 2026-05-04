# Feature 17 - Canvas Ergonomics

Add first-class canvas navigation controls and keyboard shortcuts so users can move around the architecture canvas and recover edits without breaking flow.

## Goal

Make the canvas feel like a deliberate design tool rather than a raw React Flow surface.

This feature focuses on five ergonomic improvements:

1. Give users visible zoom controls.
2. Give users visible undo and redo controls.
3. Wire the same actions to expected keyboard shortcuts.
4. Remove the minimap to reduce visual noise.
5. Keep all controls compatible with the existing collaborative Liveblocks canvas state.

## Dependencies and Existing Contracts

- The canvas is rendered by `components/editor/canvas.tsx`.
- Canvas graph state is synced through `useLiveblocksFlow`.
- Undo and redo must use Liveblocks history, not local React state snapshots.
- Zoom actions must use the active React Flow instance.
- The bottom-center `ShapePanel` already occupies the canvas overlay layer.
- Feature 16 custom edges already own edge rendering, labels, routing, and edge style controls.
- Do not change node creation, node rendering, edge rendering, project access, persistence, or Liveblocks room authentication.

## User Experience

### Control Bar Placement

Add a floating control bar at the bottom-left of the canvas.

- Position it inside the canvas surface, above the React Flow viewport.
- Keep it visually separate from the bottom-center shape panel.
- It must not overlap the shape panel at common desktop widths.
- It should remain usable when the AI sidebar is open.
- Use the dark workspace visual language from `ui-context.md`.

The bar contains two button groups:

1. Zoom controls: zoom out, fit view, zoom in.
2. History controls: undo, redo.

Separate the groups with a thin vertical divider.

### Visual Style

- Use a compact pill-shaped container.
- Use token-based colors only; do not hardcode hex colors or raw Tailwind palette classes.
- Use `rounded-xl` or `rounded-2xl` in line with existing small overlay controls.
- Use Lucide icons for every button.
- Buttons should be icon-only with accessible labels and hover/focus states.
- Disabled undo/redo buttons should be visibly dimmed and non-interactive.
- The control bar should feel like a utility surface, not a marketing card.

Recommended icons:

- Zoom out: `Minus`
- Fit view: `Scan`
- Zoom in: `Plus`
- Undo: `Undo2`
- Redo: `Redo2`

Use a better Lucide icon if it is already established locally, but keep the meaning immediately recognizable.

## Functional Requirements

### 1) Canvas Control Bar

Create a dedicated canvas control component rather than embedding all markup directly inside the main canvas component.

Suggested file:

- `components/editor/canvas-controls.tsx`

The component should receive callbacks and disabled state from the canvas owner:

- `onZoomIn`
- `onZoomOut`
- `onFitView`
- `onUndo`
- `onRedo`
- `canUndo`
- `canRedo`

Requirements:

- Clicking each button runs exactly one canvas action.
- Control clicks must not drag, select, or pan the canvas.
- The component should stop pointer/mouse event propagation where needed.
- The control bar must sit above React Flow content using the same overlay approach as the shape panel.
- Keep the component presentational; do not put React Flow or Liveblocks hook calls inside it unless the existing canvas structure makes prop threading impractical.

### 2) Zoom Actions

Wire zoom controls to the active React Flow instance.

Required actions:

- Zoom in.
- Zoom out.
- Fit the current graph into view.

Behavior:

- Use a short animation duration so movement feels smooth.
- Keep zoom increments predictable and moderate.
- `fitView` should include padding so nodes are not flush against the viewport edge.
- Zoom controls should work even when the canvas is empty; an empty canvas should not throw.

Implementation notes:

- Prefer React Flow instance methods such as `zoomIn`, `zoomOut`, and `fitView`.
- The React Flow instance can come from the existing `onInit` flow instance state or `useReactFlow` if the hook is used inside the React Flow provider tree.
- Do not create a second React Flow provider or duplicate canvas state.

### 3) Undo and Redo

Wire undo and redo to Liveblocks history.

Requirements:

- Use the existing Liveblocks history hooks/utilities available in the project setup.
- Undo should reverse the latest collaborative canvas state change supported by Liveblocks history.
- Redo should restore the latest undone collaborative canvas state change.
- Disable undo when there is nothing to undo.
- Disable redo when there is nothing to redo.
- Keyboard shortcuts and toolbar buttons must call the same undo/redo handlers.

Collaborative safety:

- Do not implement undo/redo by manually storing local arrays of nodes or edges.
- Do not make server calls for undo/redo.
- Do not persist history outside Liveblocks.
- Keep history behavior scoped to the active room.

### 4) Keyboard Shortcuts

Create a reusable keyboard shortcut hook in `hooks/`.

Required file:

- `hooks/use-keyboard-shortcuts.ts`

The hook should:

- Listen for `keydown` on `window`.
- Register and clean up listeners inside an effect.
- Accept the active React Flow instance or explicit zoom callbacks.
- Accept undo and redo handlers.
- Ignore shortcuts while the user is typing in editable controls.
- Prevent browser defaults when handling shortcuts that would otherwise affect page zoom, browser history, or text editing.

Supported shortcuts:

| Shortcut              | Action   |
| --------------------- | -------- |
| `+`                   | Zoom in  |
| `=`                   | Zoom in  |
| `-`                   | Zoom out |
| `Cmd/Ctrl + Z`        | Undo     |
| `Cmd/Ctrl + Shift + Z`| Redo     |
| `Cmd/Ctrl + Y`        | Redo     |

Editable-field guard:

The hook must ignore shortcuts when the event target is any of the following:

- `input`
- `textarea`
- `select`
- an element with `contenteditable`
- a descendant of an element with `contenteditable`

Important details:

- `Cmd` means `metaKey`; `Ctrl` means `ctrlKey`.
- Treat shortcut keys case-insensitively where appropriate.
- Do not trigger undo on `Cmd/Ctrl + Z` when `Shift` is pressed; that should redo.
- Do not trigger zoom while a user is editing node or edge labels.
- Keep the hook generic enough that it does not import canvas component internals.

### 5) Remove Minimap

Remove the React Flow `<MiniMap>` from the canvas.

Requirements:

- Do not replace it with another navigation widget in this feature.
- Remove any now-unused imports.
- Leave the bottom-right area empty.
- Keep `<Background>` and the existing canvas background treatment.

## Scope Limits

- Do not change the shape panel.
- Do not change node rendering, node shape visuals, resizing, labels, or color toolbar behavior.
- Do not change custom edge rendering, labels, routing, or edge style toolbar behavior.
- Do not add canvas search, selection menus, copy/paste, delete shortcuts, or alignment tools.
- Do not change the Liveblocks provider setup or room authentication.
- Do not change project persistence, snapshots, or background tasks.
- Do not introduce a new component library.

## Accessibility Requirements

- Every icon button must have an accessible name through `aria-label` or equivalent.
- Disabled buttons must use the native `disabled` attribute where possible.
- Toolbar controls should be keyboard focusable when enabled.
- Focus rings must be visible against the dark canvas.
- The control bar should not trap focus.

## Edge Cases

- Keyboard shortcuts do nothing before the React Flow instance is ready.
- Zoom controls do not throw on an empty canvas.
- Undo and redo stay disabled when Liveblocks reports no available history action.
- Keyboard shortcuts are ignored during node label editing.
- Keyboard shortcuts are ignored during edge label editing.
- Keyboard shortcuts are ignored inside project, share, and AI sidebar text fields.
- Holding Shift with `Cmd/Ctrl + Z` performs redo, not undo.
- `Cmd/Ctrl + Y` performs redo for Windows/Linux-style expectations.
- Toolbar pointer events do not create canvas selections or drag the viewport.
- Removing the minimap leaves no unused imports or dead minimap styling.

## Implementation Plan

1. Remove the minimap from the canvas and clean up imports.
2. Add `components/editor/canvas-controls.tsx` for the floating control bar.
3. Add `hooks/use-keyboard-shortcuts.ts` for zoom and history shortcuts.
4. Wire React Flow zoom handlers inside the canvas flow component.
5. Wire Liveblocks history undo/redo handlers and availability state.
6. Render the control bar as a canvas overlay.
7. Verify pointer event isolation, shortcut guards, disabled states, and build output.

## Check When Done

- The bottom-left canvas control bar is visible inside the workspace canvas.
- Zoom out, fit view, and zoom in buttons use the active React Flow instance.
- Zoom actions animate smoothly.
- Undo and redo buttons use Liveblocks history.
- Undo and redo buttons become disabled when unavailable.
- `hooks/use-keyboard-shortcuts.ts` handles all required shortcuts.
- Shortcut handling skips editable fields and active label editors.
- Toolbar clicks do not pan, drag, select, or otherwise disturb the canvas.
- The minimap no longer renders.
- `npm run build` passes without type errors.

## Acceptance Criteria

- Users can zoom in, zoom out, and fit the graph from the new bottom-left control bar.
- Users can undo and redo supported canvas edits from the control bar.
- Users can use standard keyboard shortcuts for zoom, undo, and redo.
- Shortcut handling does not interfere with typing in dialogs, sidebars, node labels, or edge labels.
- The canvas has less visual clutter after minimap removal.
- The implementation stays within existing React Flow and Liveblocks state boundaries.
- Build succeeds.
