Add a small floating color toolbar so selected nodes can change both their background and text color directly on the canvas.

## Goal

Let users switch a node between predefined dark-theme color pairs without leaving the canvas or opening a modal.

This feature should feel like a lightweight canvas affordance, not a separate settings panel.

## Implementation

1. Use the canonical node color palette from `types/canvas.ts` (`NODE_COLORS`).
   Each palette option includes:
   - a node background color
   - a matching text color

   The same palette is documented in `ui-context.md` and should stay in sync with the canvas types.

2. Add a toolbar above selected nodes.
   - only show it when a node is selected
   - anchor it horizontally to the selected node and place it slightly above the node without overlapping it
   - keep it visually compact so it reads as a transient canvas control
   - show one swatch per color pair in `NODE_COLORS`
   - active swatches should feel clearly selected
   - hovering a swatch should show a subtle glow based on its text color
   - keep the glow tight and controlled, not overly blurred
   - prevent toolbar interactions from dragging nodes or panning the canvas
   - if the toolbar is near the top edge of the viewport, keep it visible rather than clipping offscreen

3. When a swatch is selected:
   - update both the node background color and text color
   - update the node UI immediately
   - write the change through the existing collaborative canvas state
   - no server calls

4. The node should always render from its synced color pair.

   The node background uses `data.color.fill`, and label text uses `data.color.text`.
   Inline editing, placeholder text, and any hover/selected label treatment should continue to respect the same text color.

5. Keep the feature local to the canvas node and toolbar surface.

   - do not add a full color picker
   - do not change drag/drop behavior
   - do not rebuild node selection logic
   - do not add persistence-layer changes

## Scope Limits

- keep this focused on predefined color themes only

## Interaction Rules

- Toolbar buttons should behave like discrete controls, not draggable canvas objects.
- Clicking a swatch should not start a drag gesture, select text, or pan the canvas.
- The active swatch should remain legible against the dark workspace.
- Use the same border-radius and surface language as the rest of the editor chrome.

## Edge Cases

- A selected node near the top edge should still keep its toolbar visible.
- Re-selecting a node should preserve its active color state in the toolbar.
- Collaborative updates from another user should refresh the active swatch immediately.
- Empty-label nodes should still update their label text color when a new swatch is chosen.

## Check When Done

- Nodes use predefined background/text color pairs.
- Selected nodes show a floating color toolbar.
- Swatch selection updates both node and text colors.
- The toolbar does not interfere with dragging, panning, or node selection.
- `npm run build` passes without type errors.

## Acceptance Criteria

- The palette comes from a single canonical source and stays aligned with `ui-context.md`.
- Selecting a node shows a compact floating toolbar above it.
- Clicking a swatch updates the selected node's background and text color immediately.
- The selected node's label, placeholder, and inline edit state remain readable with the paired text color.
- Toolbar interactions do not trigger unwanted canvas drag or pan behavior.
- The build succeeds.