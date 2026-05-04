Add production-grade node resizing and inline text editing to the canvas, with polished behavior similar to modern diagram tools.

## Goal

Make node editing feel deliberate, fast, and stable in a real-time collaborative room.

This unit should provide a "D5-style" editing feel:

1. Resize affordances are visible only when relevant and are easy to control.
2. Text editing feels direct and in-place, not modal.
3. Node updates remain collaborative and conflict-safe.

## Dependencies and Existing Contracts

- Shapes, colors, and node data contracts are defined in `types/canvas.ts`.
- Node rendering from Feature 13 must remain intact (shape-specific visuals are already done there).
- Canvas graph state is synchronized with Liveblocks through `useLiveblocksFlow`.
- Node creation and drag preview behavior from Features 12 and 13 are already established and must not change.

## Functional Requirements

### 1) Node Resizing

Enable resizing for selected nodes using React Flow resize affordances.

#### 1.1 Visibility and activation

- Resize handles are shown only when a node is selected.
- Handles are hidden for non-selected nodes.
- Handles remain usable for all supported shapes.

#### 1.2 Direction support

- Support standard corner resizing at minimum.
- Side handles are allowed if they improve UX, but must not degrade precision.
- Aspect ratio is free by default (no forced lock in this feature).

#### 1.3 Size constraints

Define per-shape minimum dimensions to preserve readability and avoid broken geometry.

Suggested minimums (can be tuned in implementation as long as intent is preserved):

- rectangle: min width 120, min height 56
- pill: min width 120, min height 48
- circle: min width 72, min height 72 (maintain equal sides when possible)
- diamond: min width 100, min height 100
- cylinder: min width 100, min height 80
- hexagon: min width 110, min height 80

General rule:

- no node may be resized below width 72 or height 48 regardless of shape.

#### 1.4 Styling and contrast

- Resize handles are subtle in rest state, brighter on hover/focus.
- Styling follows dark canvas visual language.
- Handle styling must not overpower node content.

#### 1.5 Resize commit behavior

- Resizing updates node dimensions through the existing collaborative node update flow.
- Resize should be visually smooth during drag.
- Final dimensions are committed without requiring an additional user action.

### 2) Inline Label Editing

Enable direct, in-place editing of node labels.

#### 2.1 Entry and exit

- Enter edit mode by double-clicking the node label/center region.
- Exit edit mode on blur.
- Exit edit mode on Escape and discard edits made in the current edit session.
- Save edits on Enter when Shift is not pressed.
- Insert newline on Shift+Enter.

#### 2.2 Editing surface

- Use an inline textarea overlay aligned with the existing label position.
- Textarea inherits node text color and keeps centered alignment by default.
- Editing overlay should not cause node size or shape layout shifts.

#### 2.3 Placeholder and empty states

- When label is empty and not editing, show placeholder text in the same centered location.
- Placeholder must be visually muted but readable against all node fills.
- Empty string is valid and must not break rendering.

#### 2.4 Text behavior

- Label updates in real time while typing (live collaborative updates).
- Long text wraps within available node bounds.
- Overflow should be clipped or wrapped cleanly, never rendered outside the visual node boundary.

#### 2.5 Input safety

- While editing text, pointer and keyboard interactions must not drag nodes or pan the canvas.
- Prevent event bubbling from textarea interactions to the canvas when needed.
- Support IME composition safely (do not prematurely commit/cancel during composition).

### 3) Collaboration and Conflict Safety

- Resizing and label edits must use the existing synced node state path.
- Do not introduce local shadow copies of node dimensions/label that can diverge.
- Concurrent edits follow existing last-write semantics of the shared state layer.
- Local editing UI state (focus, draft text, caret state) remains client-local and non-persistent.

## Interaction and UX Rules

- Keep editing interactions minimal and predictable.
- No animation-heavy transitions are required; subtle transitions are acceptable.
- Selection state remains clearly visible while editing or resizing.
- Cursor styles should communicate interaction mode (text vs resize vs drag).

## Technical Notes

- Preferred implementation approach:
  - Use React Flow node-resize utilities for resize affordances.
  - Keep shape renderer untouched except where needed to host editing overlay.
  - Keep update logic routed through the same node change mechanism used elsewhere.
- If shape-specific constraints are hard to enforce dynamically, implement a shared min-size utility keyed by shape.

## Scope Limits

- Do not modify shape rendering semantics from Feature 13.
- Do not modify shape panel behavior or drag preview behavior.
- Do not change node creation payload or id generation.
- Do not add node rotation.
- Do not add rich text formatting (bold, links, lists).
- Do not add keyboard shortcuts beyond editing controls listed above.
- Do not add persistence-layer changes.

## Edge Cases

- Fast resize drags do not leave nodes in invalid dimensions.
- Resize while node has empty label remains stable.
- Double-click near handles should not unintentionally enter label editing.
- Escape during IME composition should not corrupt text.
- Blur caused by clicking another node should commit current text before switching selection.
- Multi-line text on small nodes remains readable enough and does not spill outside shape bounds.

## Verification Plan

### Manual checks

1. Select each shape type and verify resize handles appear only for selected nodes.
2. Resize each shape below attempted minimum and confirm constraint enforcement.
3. Double-click center of node and verify inline textarea opens.
4. Type label content and confirm real-time update.
5. Press Enter to save, Shift+Enter for newline, Escape to cancel current session edits.
6. Click outside node to blur and confirm edit session closes cleanly.
7. Attempt to pan/drag canvas while typing and confirm it is prevented.

### Collaboration checks

- With two clients in the same room, resizing by client A is visible live to client B.
- Inline text edits by client A stream live to client B.
- No duplicate nodes or desynced labels are introduced during concurrent interactions.

### Build and quality gate

- `npm run build` passes without type errors.
- No new lint/type issues in modified files.

## Acceptance Criteria

- Selected nodes expose resize handles and can be resized smoothly.
- Node dimensions persist through the existing collaborative state flow.
- Inline label editing opens on double-click and feels in-place.
- Label editing exits correctly on blur, Enter save, and Escape cancel.
- Text interactions do not trigger node dragging or canvas panning.
- Shape visuals from Feature 13 remain unchanged.
- Collaboration remains stable for resize and text updates.
- Build succeeds.