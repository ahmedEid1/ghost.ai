# Feature 21.5 - Canvas Node and Edge Deletion

Add straightforward deletion of nodes and edges through keyboard shortcuts and context menu so users can clean up architecture diagrams without precision clicking or dialog friction.

## Goal

Provide familiar, non-disruptive deletion affordances that feel native to design tools.

This feature delivers:

1. Windows-style drag selection: click and drag to select multiple nodes/edges in a box.
2. Keyboard deletion: Delete and Backspace keys on selected items.
3. Right-click context menu with delete option for nodes and edges.
4. Cascading edge deletion when a node is removed (connected edges go with it).
5. Reliable collaborative state sync through Liveblocks history.

## Dependencies and Existing Contracts

- Canvas state is synchronized in-room through Liveblocks + React Flow.
- Nodes and edges use existing React Flow selection and deletion abstractions.
- Liveblocks history automatically captures deletion operations for undo/redo.
- Feature 17 canvas ergonomics already provides undo/redo UI.
- Access control is enforced at Liveblocks room auth (all writers have equal canvas permissions).
- Canvas node and edge rendering already handle selected state for hover affordances.

Do not change access control, Liveblocks room setup, or node/edge rendering behavior in this unit.

## User Experience

### 1) Selection Model

Both nodes and edges support selection.

Current model:
- Click a node or edge to select it.
- Selected state applies visual styling (border highlight, toolbar appearance).
- React Flow supports multiple selection via Ctrl/Cmd+Click.
- Hold Shift to add/remove items from selection.

Deletion interaction builds on this existing model.

### 2) Drag Selection (Box/Marquee)

Add Windows-style drag selection to select multiple items at once.

Behavior:

- Click and drag on empty canvas (not on a node/edge) to create a selection box.
- The box appears as a semi-transparent rectangle with a border.
- Any nodes or edges that intersect the box become selected.
- Release the mouse to finalize the selection.

Modifiers:

- **Normal drag**: Replace current selection with drag-selected items.
- **Shift+drag**: Add drag-selected items to current selection.
- **Ctrl/Cmd+drag**: Toggle items in the box (add if unselected, remove if selected).

Visual feedback:

- Semi-transparent fill (`rgba(0, 200, 212, 0.1)` or similar accent-dim color).
- Solid border in accent primary color.
- Box updates in real time as mouse moves.

Edge cases:

- Drag selection does not trigger on nodes being dragged (drag node takes priority).
- Drag selection cancels if the user starts on a node/edge (node drag takes over).
- Very small drags (< 5px) are ignored to avoid accidental selections.

Implementation:

- Listen for `onPaneMouseDown` and `onPaneMouseMove`/`onPaneMouseUp` on the React Flow pane (not on nodes).
- Calculate which nodes/edges intersect the selection box.
- Render the selection box overlay via a React component inside the canvas.

### 3) Keyboard Deletion

Provide two familiar keyboard shortcuts:

- `Delete` key
- `Backspace` key

Behavior:

- When one or more nodes or edges are selected, pressing Delete or Backspace removes them.
- If no items are selected, the shortcuts do nothing.
- Deletion happens immediately without confirmation (undo is available).
- Keyboard shortcuts are ignored during node label editing or edge label editing.

Edge cases:
- During label editing, Delete and Backspace insert characters as normal.
- In the AI sidebar textarea or other input fields, Delete and Backspace work as normal text editing.

### 4) Context Menu Deletion

Add a right-click context menu on selected nodes and edges.

Menu placement:
- Show the menu at the right-click cursor position.
- Position it above/below the click to avoid mouse interference.

Menu content:
- Single item: `Delete` with a descriptive label or icon.
- If multiple items are selected, the menu label can indicate count: `Delete 3 items` or simply `Delete`.

Menu behavior:
- Clicking `Delete` removes all selected items.
- Pressing Escape dismisses the menu without action.
- Clicking elsewhere dismisses the menu without action.

UX polish:
- Keep the menu compact and use the dark workspace visual language.
- Use shadcn/ui context primitives or a lightweight custom context menu.
- Icon (trash/X) is optional if space/clarity permits.

### 5) Cascading Deletion

When a node is deleted:
- The node is immediately removed from the canvas.
- All edges connected to that node are automatically removed.
- Edge deletion does not create any orphaned nodes.

When an edge is deleted:
- The edge is removed.
- Source and target nodes remain intact.

Rationale:
- Matches standard architecture/flow diagram tool behavior.
- Keeps the graph in a valid state (no edges pointing to missing nodes).

### 6) Visual Affordances

Provide subtle deletion hints to users.

Suggestions:
- When a node or edge is selected, a small delete icon or hotkey hint could appear in the node/edge toolbar (Feature 15 and Feature 16 already show toolbars on selection).
- The context menu itself is the primary affordance for mouse users.
- No additional UI chrome needed beyond keyboard/context menu.

## Functional Requirements

### 1) Drag Selection Handler

Add support for selecting multiple items via drag-to-box on the canvas.

Location:
- Inside `CanvasFlow` component as event handlers on the React Flow pane.

Implementation:

- Listen to `onPaneMouseDown` to detect drag start on empty canvas (not on a node/edge).
- Track `onPaneMouseMove` to update the selection box and calculate intersecting items.
- On `onPaneMouseUp`, finalize the selection by calling React Flow's selection setters.
- Render a semi-transparent selection box overlay during drag.

Selection logic:

- Use bounding box collision detection to find nodes/edges that intersect the drag rectangle.
- For nodes: check if node bounds overlap the selection box.
- For edges: check if edge path passes through or touches the selection box (approximate via source/target node proximity).

Modifiers:

- **No modifier**: replace selection.
- **Shift key held**: add to selection (union).
- **Ctrl/Cmd key held**: toggle (XOR).

Edge detection:

- Threshold: ignore drags < 5px to prevent accidental selection.
- Cancel drag if the user starts drag on a node/edge handle (node drag takes priority).

### 2) Deletion Handler

Add a reusable deletion handler in the canvas flow logic.

Location:
- Inside `CanvasFlow` component or extracted to a shared hook if reuse is needed.

Behavior:
- Accept a list of selected node IDs and edge IDs.
- Remove nodes via `onNodesChange([{ type: "remove", id }])`.
- Remove edges via `onEdgesChange([{ type: "remove", id }])`.
- When removing a node, also remove all edges where `source === nodeId || target === nodeId`.

Implementation approach:
- Use React Flow's built-in `onDelete` handler if it already supports multi-select deletion.
- If not, build a dedicated handler that iterates selected items.

### 3) Keyboard Handler Integration

Wire keyboard handler to the deletion handler.

Add keyboard listener in the canvas flow:
- Listen for `keydown` events.
- Check if the active element is an editable field (textarea, input, contenteditable).
- If editable, skip the handler (let normal editing behavior proceed).
- If not editable, check for Delete or Backspace.
- On key press, call deletion handler with current selected nodes and edges.

Alternative approach:
- Extend the existing `use-keyboard-shortcuts` hook (Feature 17) to include Delete/Backspace.
- This keeps all keyboard logic in one place.

### 4) Context Menu Implementation

Build a minimal context menu component or integrate with an existing menu library.

Suggested file:
- `components/editor/canvas-context-menu.tsx` (if custom)
- or use shadcn ContextMenu primitives if they are available

Behavior:
- Show on right-click inside the canvas pane.
- Listen for `onContextMenu` on the React Flow pane.
- Determine if the click target is a selected node, selected edge, or empty canvas.
- If a node or edge is selected (single or multi), show the Delete option.
- If no selection, optionally show a minimal menu or hide it entirely.

Position:
- Render the menu at `event.clientX`, `event.clientY`.
- Use CSS/positioning to keep it visible within the viewport.

### 5) Collaborative Sync

Deletions must sync through Liveblocks.

Expectations:
- All deletions go through React Flow's `onNodesChange` and `onEdgesChange`.
- These are already wired to Liveblocks via `useLiveblocksFlow`.
- No additional persistence logic needed; Liveblocks handles sync automatically.
- Deletions appear in all participants' views in real time.
- Deletions are included in Liveblocks history for undo/redo.

## Accessibility Requirements

- Delete and Backspace must work for keyboard-only users.
- Context menu must be keyboard accessible:
  - Show on Shift+F10 (Windows/Linux context menu key) or Cmd+Click (Mac).
  - Navigate menu with arrow keys.
  - Activate menu item with Enter.
  - Dismiss with Escape.
- Menu must have proper focus indication and ARIA labels.
- No color-alone communication (use text or icon + label).

## Edge Cases

- Drag selection started on empty canvas but user ends on a node: node drag takes priority, no selection.
- Very small drag (< 5px): ignored to prevent accidental selections.
- Drag with Shift or Ctrl modifier while already having items selected: applies the modifier logic (add/toggle).
- Drag that would select everything: no limit, all intersecting items are selected.
- User selects a node, then right-clicks an unselected edge: behavior choice:
  - (A) Clear node selection, select the edge, show menu for edge only.
  - (B) Select both node and edge, show menu for "Delete 2 items".
  - Recommendation: Choose (A) to match most design tool behavior (right-click selects the target).

- Rapid fire Delete key presses: debounce or allow each press to trigger a separate undo/redo step.
  - Recommendation: allow each press (keeps undo/redo granular and predictable).

- Delete pressed while dragging a node: ignore the press (drag is in progress).
  - Handle via React Flow drag state or layer check.

- Delete pressed while panning/zooming canvas: ignore.
  - Only trigger deletion on canvas focus, not global keydown.

- Context menu on an unselected item: clarify whether right-click auto-selects (recommendation: yes, for consistency).

- Network/sync lag: deletions queue locally via React Flow and sync when room is available (normal Liveblocks behavior).

- Undo after deletion: restores the deleted node and its connected edges (handled by Liveblocks history).

## Scope Limits

- Do not add additional multi-selection visual modes beyond React Flow's existing selection styling and the drag selection box.
- Do not add cut/copy/paste in this feature (separate concern).
- Do not add soft-delete or trash bin.
- Do not require confirmation dialogs (undo is available).
- Do not add selection filters or advanced query UX.
- Do not alter node/edge rendering or selection model behavior.
- Do not add lasso selection (free-form drawing); only rectangular drag selection.

## Implementation Plan

1. Add drag selection handler:
   - Listen to `onPaneMouseDown` to detect start on empty canvas.
   - Track `onPaneMouseMove` to update selection box and intersect nodes/edges.
   - On `onPaneMouseUp`, finalize selection with modifier logic (normal/Shift/Ctrl).
   - Render semi-transparent selection box overlay during drag.
2. Determine keyboard listener location: extend existing `use-keyboard-shortcuts` hook or add new handler in canvas flow.
3. Add keyboard Delete/Backspace handler that:
   - Checks for editable focus.
   - Calls deletion handler on selected items.
4. Build cascading deletion logic: when node deleted, also remove connected edges.
5. Add minimal context menu component or integrate shadcn primitives.
6. Wire context menu to show on canvas right-click with Delete option.
7. Test drag selection with no modifiers, Shift, and Ctrl modifiers.
8. Test keyboard shortcuts during label editing and sidebar focus.
9. Test keyboard shortcuts during node drag and canvas pan.
10. Verify Liveblocks sync for deletions across participants.
11. Verify undo/redo works for deleted items.
12. Run `npm run build`.

## Check When Done

- Clicking and dragging on empty canvas creates a selection box.
- Items (nodes and edges) that intersect the box become selected.
- Shift+drag adds items to the current selection.
- Ctrl/Cmd+drag toggles items in the box (add/remove).
- Very small drags (< 5px) are ignored.
- Pressing Delete or Backspace on a selected node removes it and its connected edges.
- Pressing Delete or Backspace on a selected edge removes only the edge.
- Pressing Delete or Backspace on multiple selected items removes all of them.
- Right-click on a selected node or edge shows a context menu with Delete option.
- Delete/Backspace do not trigger during node label editing or edge label editing.
- Delete/Backspace do not trigger during text input in sidebars or AI composer.
- Deletions sync in real time to other participants via Liveblocks.
- Deleted items can be restored via Undo (Feature 17 controls).
- `npm run build` passes.

## Acceptance Criteria

- Users can select multiple nodes/edges via Windows-style drag selection box.
- Drag selection modifiers (Shift to add, Ctrl/Cmd to toggle) work as expected.
- Users can delete single or multiple selected items using Delete or Backspace keyboard shortcuts.
- Users can delete items using right-click context menu.
- Deleting a node automatically removes its connected edges.
- Keyboard shortcuts are properly scoped and do not interfere with text editing.
- Drag selection is properly scoped and does not trigger during node drags.
- Deletions are immediately visible to all collaborators in the room.
- Undo properly restores deleted nodes and edges with all their properties intact.
- The implementation respects existing React Flow and Liveblocks abstractions without introducing custom state management.
