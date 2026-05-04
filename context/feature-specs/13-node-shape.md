Replace the temporary node placeholder renderer with production-ready node shape visuals and add a drag ghost preview so users can confidently place shapes on the canvas.

## Goal

Deliver a clear visual language for node shapes in the collaborative canvas while preserving all current data flow and collaboration behavior.

This feature must improve usability in two ways:

1. Users can immediately distinguish node meaning by shape.
2. Users can see exactly what they are dragging before dropping a node.

## Dependencies and Existing Contracts

- Shapes and colors are defined in `types/canvas.ts` (`NODE_SHAPES`, `NODE_COLORS`).
- Nodes are created through the existing drag/drop path introduced in Feature 12.
- Canvas state remains Liveblocks-backed through `useLiveblocksFlow`.
- Node type remains `canvasNode`; this unit only upgrades how it renders.

## Functional Requirements

### 1) Shape Rendering in Canvas Nodes

Upgrade `canvasNode` rendering from a generic box to true shape-specific visuals.

#### 1.1 Shape mapping

- `rectangle`: CSS box.
- `pill`: CSS rounded full rectangle.
- `circle`: CSS fully rounded square.
- `diamond`: SVG polygon.
- `hexagon`: SVG polygon.
- `cylinder`: SVG composed shape (body + top ellipse + bottom curve treatment).

#### 1.2 Size behavior

- All shapes must respect node width and height from React Flow node dimensions.
- SVG shapes must scale proportionally to current node dimensions.
- Label area must remain readable at the default drop sizes defined in Feature 12.

#### 1.3 Color and border behavior

- Use `data.color.fill` as shape fill and `data.color.text` for text.
- Borders at rest are subtle.
- Borders become more prominent when node is selected.
- Hover styling must not conflict with selected styling.

#### 1.4 Label behavior

- Label stays centered.
- Empty labels remain valid and render without layout break.
- Text should truncate gracefully if longer than available shape width.

#### 1.5 Handles

- Existing four connection handles (top, right, bottom, left) remain.
- Handle visibility behavior stays the same as Feature 12 (hidden by default, shown on hover).
- Shape rendering must not block pointer interaction with handles.

### 2) Drag Ghost Preview

Add visual drag feedback while dragging from the shape panel.

#### 2.1 Trigger and lifecycle

- On shape drag start from the panel, show a ghost preview.
- Keep preview visible and moving with the cursor until drag end.
- Hide preview on successful drop.
- Hide preview on drag cancel or drop outside target canvas.
- Clean up preview state on unmount.

#### 2.2 Preview fidelity

- Preview shape must match dragged `shape` exactly.
- Preview size must match dragged default `width` and `height`.
- Preview styling should mirror node shape style enough for recognition (fill/border treatment can be simplified).
- Preview is visual only and must not mutate canvas state by itself.

#### 2.3 Positioning and layering

- Preview follows cursor with small offset so cursor remains visible.
- Preview renders above canvas content and below modal/dialog overlays.
- Preview must not interfere with drop handling (pointer-events disabled).

### 3) Collaboration and State Safety

- Keep node rendering fully driven by synced Liveblocks node data.
- Do not introduce local-only node state that can diverge from collaborative state.
- Drag preview state is local UI state only; it must never be persisted.

## Interaction and UX Rules

- Node visuals should remain legible at the current dark theme and token system.
- Motion should be minimal and purposeful (no complex animation required).
- Selection/hover signals should be clear but not visually noisy.

## Scope Limits

- Do not rebuild shape panel layout or icon set.
- Do not change node creation payload structure.
- Do not add node resize behavior.
- Do not add inline label editing.
- Do not add keyboard shortcuts.
- Do not change persistence/storage behavior.

## Edge Cases

- Drag starts and ends without entering the canvas: preview appears then cleans up.
- Fast drag across viewport boundaries: preview does not get stuck.
- Dropping shape while another node is selected: drop still works as before.
- Empty label nodes render correctly for all six shapes.
- Long labels do not overflow outside visual shape bounds.

## Implementation Notes

- Prefer shape rendering logic inside the existing node component so the React Flow node type remains unchanged.
- For SVG shapes, use a `viewBox` and stretch to node dimensions through CSS sizing.
- Keep any shape helper utilities small and colocated unless reused elsewhere.

## Verification Plan

### Manual checks

1. Drag each of the six shapes and confirm preview type and size match drop defaults.
2. Drop each shape and confirm node renders as correct variant.
3. Select each dropped node and confirm border emphasis changes correctly.
4. Hover node and confirm handles appear and remain usable.
5. Drag outside canvas and release; confirm preview cleanup.

### Functional checks

- Multiple users in same room see identical node shapes for shared nodes.
- No duplicate node creation from drag preview logic.
- Existing drag/drop creation path still produces valid `canvasNode` entries.

### Build and quality gate

- `npm run build` passes without type errors.
- No new lint/type issues introduced in touched files.

## Acceptance Criteria

- Canvas nodes render real shape variants for all six supported shape types.
- CSS-rendered shapes (`rectangle`, `pill`, `circle`) display correctly.
- SVG-rendered shapes (`diamond`, `hexagon`, `cylinder`) display correctly and scale with node size.
- Dragging a shape shows a cursor-following ghost preview with matching shape and default size.
- Ghost preview always cleans up on drop/cancel/end.
- Collaborative syncing behavior remains intact.
- Build succeeds.