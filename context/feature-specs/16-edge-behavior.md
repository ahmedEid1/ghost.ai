Replace the default canvas edges with custom edges that are easier to follow, easier to click, and support inline labels without leaving the canvas.

## Goal

Make edge interactions feel deliberate and legible in a dark collaborative diagram canvas.

The edge system should support three things well:

1. Clear connection lines that are easy to read at a glance.
2. A larger interactive target than the visible stroke.
3. Inline label editing that stays tied to collaborative edge state.

## Dependencies and Existing Contracts

- Node handles already exist on the canvas nodes and remain the entry points for edge creation.
- Edge state is part of the existing Liveblocks-synced canvas graph.
- Edge rendering should stay within the current React Flow canvas surface.
- Do not change node creation, shape creation, or project persistence behavior.

## Functional Requirements

### 1) Edge Rendering

Create a custom canvas edge type for newly created edges.

#### 1.1 Visual style

- Use a thin, light stroke with rounded ends.
- Add an arrowhead at the destination end of each edge.
- Keep edges slightly dimmed at rest.
- Brighten edges on hover and when selected.
- Preserve the dark technical workspace look; edges should feel secondary to nodes.

#### 1.2 Routing and shape

- Use orthogonal or smooth-step style routing that is easy to trace visually.
- The route should avoid awkward visual overlaps where possible.
- The visible stroke must remain stable enough for inline labels to sit on top of it.

#### 1.3 Interaction target

- Make edges easier to hover and click without making the visible line thicker.
- Use a larger invisible interaction path or equivalent hit area strategy.
- Hover and selection states should respond to the edge body, not just the label.

### 2) Inline Edge Labels

Add inline label editing directly on the edge.

#### 2.1 Entry and exit

- Double-click an edge to edit its label.
- Exit edit mode on blur.
- Save edits on Enter when Shift is not pressed.
- Allow Escape to close the editor without leaving the edge in a broken state.

#### 2.2 Positioning

- Render the label with React Flow's `EdgeLabelRenderer`.
- Use the path midpoint from `getSmoothStepPath` to position the label.
- Do not calculate midpoint coordinates manually.
- Keep the label centered on the visible path segment.

#### 2.3 Editing surface

- Use a compact input or textarea that expands with the label text.
- Keep the editor visually consistent with the dark canvas surface language.
- Show saved labels as small pill badges when not editing.
- When an active edge has no label, show a faint hint rather than leaving ambiguous spacing.

#### 2.4 Input safety

- Prevent label clicks and typing from dragging or panning the canvas.
- Stop event bubbling where needed so the canvas remains stable while editing.
- Keep the local editing state client-only and ephemeral.

### 3) Collaborative State Safety

- Update edge labels through the existing collaborative edge data flow.
- Do not introduce a separate local source of truth for labels.
- Hover and selection state may be local UI state, but the label itself must stay synced.

## Scope Limits

- Do not change how nodes are created.
- Do not change the shape panel.
- Do not redesign the node renderer beyond the already-existing connection handles.
- Do not add edge comments, edge menus, or edge deletion UX in this unit.
- Keep this focused on edge rendering, hover/selection, and inline labels.

## Edge Cases

- Very short edges still show the label without collapsing the interaction target.
- Empty labels remain valid and do not break layout.
- Selecting an edge while another edge is being edited should not lose the in-progress label unexpectedly.
- Hovering the edge near the label should still feel easy to target.
- Edges remain readable when multiple connections overlap.

## Check When Done

- New edges use the custom canvas edge type with arrows.
- Edge hover and selection are handled in the custom edge renderer.
- Edge labels open on double-click and render through `EdgeLabelRenderer`.
- Edge label position uses the path midpoint from `getSmoothStepPath`.
- Edge labels update through the existing collaborative edge data flow.
- The edge interaction target is easier to click without thickening the visible stroke.
- `npm run build` passes without type errors.

## Acceptance Criteria

- The canvas uses a custom edge renderer for newly created edges.
- Edges are easier to read and easier to click than the default treatment.
- Arrowheads, hover states, and selection states are visually consistent with the dark workspace.
- Inline edge labels can be edited in place and stay positioned with the edge path.
- Edge label edits remain collaborative and do not require server calls.
- Build succeeds.