# Feature 18 - Starter Templates

Add a curated starter template library so users can replace an empty or in-progress canvas with a useful prebuilt system design.

## Goal

Help users begin architecture work from a strong baseline instead of dragging every node from scratch.

This feature should make template import feel native to the collaborative canvas:

1. Users can open a starter template library from the workspace navbar.
2. Users can inspect a small visual preview before importing.
3. Importing a template replaces the current canvas graph.
4. The imported graph uses the same node and edge schema as hand-built canvas content.
5. The imported graph is written through the existing Liveblocks-synced canvas state.

## Dependencies and Existing Contracts

- The product scope already includes static starter system designs.
- Templates are static codebase data, not database records.
- Template imports happen inside the active Liveblocks room.
- Canvas nodes use the shared `CanvasNodeData` contract from `types/canvas.ts`.
- Canvas nodes use type `"canvasNode"` and supported shapes from `NODE_SHAPES`.
- Canvas node colors must come from the canonical `NODE_COLORS` palette.
- Canvas edges use type `"canvasEdge"` and must be compatible with Feature 16 edge data.
- The canvas is rendered by `components/editor/canvas.tsx` using `useLiveblocksFlow`.
- Feature 17 removed the minimap and added bottom-left canvas controls; do not reintroduce minimap behavior.
- Do not add persistence, API routes, database tables, or background tasks for templates in this feature.

## User Experience

### Entry Point

Add a workspace navbar action that opens the starter template library.

Requirements:

- Place the action in the existing right-side navbar action group.
- Use an icon-only button with an accessible label.
- The button should sit near the AI and Share actions without crowding the breadcrumb.
- Use a Lucide icon that communicates templates or layouts, such as `PanelsTopLeft`, `LayoutTemplate`, or the closest available equivalent.
- The action opens a modal dialog; it does not navigate away from the editor.

Suggested accessible label:

- `Open starter templates`

### Template Modal

Create a modal that shows the available templates as a compact library.

Suggested file:

- `components/editor/starter-templates-modal.tsx`

The modal should:

- Use the existing `EditorDialog` wrapper or shadcn dialog primitives already used by the editor.
- Use the dark workspace visual language from `ui-context.md`.
- Show a clear title and short description.
- Render template cards in a scrollable grid.
- Keep the grid usable when there are more templates later.
- Include one import action per template.
- Close after a successful import.

Each template card should show:

- Diagram preview.
- Template name.
- Short description.
- Optional category or node/edge count if it improves scanability without clutter.
- Import button.

Import copy should make replacement behavior clear enough that users understand the current canvas will be overwritten.

Recommended import button copy:

- `Use template`

### Replacement Behavior

Importing a template replaces the active canvas graph.

Requirements:

- Clear all existing nodes.
- Clear all existing edges.
- Add the selected template nodes.
- Add the selected template edges.
- Fit the React Flow viewport to the imported graph after import.
- Keep the operation inside the existing collaborative canvas state flow.

User-facing behavior:

- A collaborator in the same room should see the canvas update after import.
- The modal should close once the import has been applied.
- The imported diagram should appear fully in view.
- The import should not append on top of existing work.

Safety expectation:

- Replacement is intentionally destructive for the current room state.
- This feature does not need a separate confirmation dialog unless the implementation can cheaply detect that the canvas is non-empty and the UX remains lightweight.
- If confirmation is added, it must be contained within the modal flow and must not introduce new persistence or routing.

## Functional Requirements

### 1) Template Data

Create a dedicated template data module.

Required file:

- `components/editor/starter-templates.ts`

The module should export:

- `CanvasTemplate` interface.
- `CANVAS_TEMPLATES` array.

Suggested `CanvasTemplate` shape:

```ts
export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasTemplateNode[];
  edges: CanvasTemplateEdge[];
}
```

The concrete node and edge item types should be compatible with React Flow and the existing canvas types. Prefer deriving them from the current canvas contracts instead of duplicating loosely typed objects.

Template nodes must include:

- Stable `id`.
- `type: "canvasNode"`.
- `position`.
- `data.label`.
- `data.shape`.
- `data.color`.
- Useful `width` and `height` values.

Template edges must include:

- Stable `id`.
- `type: "canvasEdge"`.
- `source`.
- `target`.
- `sourceHandle` and `targetHandle` where needed.
- `data` compatible with `CanvasEdgeData`.

Data quality requirements:

- Use readable IDs such as `microservices-api-gateway`, not timestamp IDs.
- Use labels that describe real architecture components.
- Use edge labels when they make the system flow easier to understand.
- Use node shape semantics from `ui-context.md`.
- Use the canonical color palette from `NODE_COLORS`; do not inline unrelated colors.
- Keep coordinates intentional and preview-friendly.
- Avoid overlapping nodes and crossing edges where practical.

### 2) Required Templates

Include at least three templates.

Required baseline set:

1. Microservices Platform.
2. CI/CD Pipeline.
3. Event-Driven System.

Each template should represent a plausible system architecture, not a decorative sample.

#### Microservices Platform

Purpose:

- Show a typical product architecture with clients, edge routing, services, data stores, and async messaging.

Recommended components:

- Web or mobile client.
- API gateway.
- Auth service.
- User service.
- Billing or orders service.
- Primary database.
- Cache.
- Message queue or event bus.
- Observability or external integration.

#### CI/CD Pipeline

Purpose:

- Show code moving from source control through validation, build, deployment, and runtime.

Recommended components:

- Developer or repository.
- Source control.
- CI runner.
- Test stage.
- Build artifact.
- Container registry or artifact store.
- Deployment stage.
- Production environment.
- Monitoring or rollback path.

#### Event-Driven System

Purpose:

- Show producers, an event backbone, consumers, projections, and analytics.

Recommended components:

- Event producer.
- Ingestion API.
- Event bus or stream.
- Worker or consumer services.
- Read model or projection database.
- Data warehouse or analytics sink.
- Notification service.
- Dead-letter queue or retry flow.

### 3) Template Preview

Add a lightweight diagram preview to every template card.

Requirements:

- Do not use a React Flow instance for previews.
- Render the preview with plain HTML/SVG/React elements.
- Fit the preview into a fixed-size viewport.
- Calculate bounds from template node positions and dimensions.
- Draw edges as simple SVG lines or polylines between node centers.
- Draw arrowheads only if they stay lightweight and legible.
- Draw nodes using their template shape and color data.
- Keep labels short or clipped in the preview.
- The preview must not be interactive.

Preview behavior:

- Templates with negative or sparse coordinates should still fit correctly.
- The preview should preserve the relative layout of the template.
- The preview should include padding around the diagram.
- The preview should handle empty nodes defensively, even though shipped templates should not be empty.

Implementation notes:

- A small helper such as `getTemplateBounds(template.nodes)` is acceptable.
- A small helper such as `projectTemplatePointToPreview(...)` is acceptable.
- Shape rendering may reuse existing shape concepts, but do not couple the preview to the full canvas node renderer if that makes the preview heavy or interactive.

### 4) Import Flow

Wire the modal into the editor and canvas.

Expected ownership split:

- `WorkspaceShell` or another existing editor-level component owns modal open/close state.
- `WorkspaceNavbar` receives an `onStarterTemplatesOpen` callback.
- `StarterTemplatesModal` receives `open`, `onOpenChange`, and `onImport`.
- `Canvas` or `CanvasFlow` owns the actual graph replacement because it has access to Liveblocks/React Flow state.

The final implementation may choose a different prop path if it better matches the current component tree, but keep responsibilities clean:

- Navbar opens UI.
- Modal selects a template.
- Canvas applies graph state changes.

Graph replacement requirements:

- Use the existing `onNodesChange` and `onEdgesChange` flow, or another established Liveblocks-compatible setter if the codebase already exposes one.
- Do not mutate imported template objects directly.
- Clone template nodes and edges before inserting them into canvas state.
- Preserve template IDs on import unless duplicate IDs create a real issue in the active graph replacement flow.
- Ensure imported edges point to imported node IDs.
- Use the existing `canvasEdge` type and default edge data shape where template edge data omits optional values.
- Fit the view after the imported graph is present.

History behavior:

- Template import should participate in Liveblocks history if the existing synced state flow supports it naturally.
- Do not build custom undo stacks for templates.
- Do not bypass Liveblocks history with local-only state replacement.

### 5) Empty State Compatibility

If the current canvas is empty, importing a template should feel like choosing a starting point.

Requirements:

- The import action should work the same whether the canvas is empty or non-empty.
- No separate onboarding screen is required in this feature.
- Do not block users from importing multiple templates in a row.

## Scope Limits

- Do not add user-created templates.
- Do not add template saving.
- Do not add template editing.
- Do not add server persistence for template definitions.
- Do not add API routes for templates.
- Do not add database models or migrations.
- Do not change node rendering behavior.
- Do not change edge rendering behavior.
- Do not change the shape panel.
- Do not change canvas snapshot storage.
- Do not add AI-generated template suggestions.
- Do not add categories, search, or filtering unless needed to keep the three-template UI clean.

## Accessibility Requirements

- The navbar action must have an accessible name.
- The modal must have a clear title.
- Template cards must expose template names as readable text.
- Import buttons must be keyboard reachable.
- Preview graphics should be marked decorative if the name and description already communicate the template.
- The modal must close with standard dialog behavior such as Escape and outside click if that is how existing editor dialogs behave.
- Focus should return to the navbar trigger after closing when supported by the dialog primitive.

## Edge Cases

- Importing into a non-empty canvas replaces all existing nodes and edges.
- Importing while another collaborator is present updates the shared room state.
- Importing two templates in a row leaves only the second template on the canvas.
- Edges do not remain after their source or target nodes are cleared.
- Fit view does not throw if a template has no nodes.
- Preview bounds work with nodes of different sizes.
- Preview bounds work if coordinates do not start at `0,0`.
- Template data does not rely on runtime-generated IDs.
- Template cards remain readable on smaller editor widths.
- Existing node and edge editing tools still work on imported items.

## Implementation Plan

1. Define `CanvasTemplate`, helper types, helpers, and `CANVAS_TEMPLATES` in `components/editor/starter-templates.ts`.
2. Create the three baseline templates with typed nodes, edges, colors, shapes, labels, dimensions, and positions.
3. Build a lightweight preview renderer inside `components/editor/starter-templates-modal.tsx` or a small sibling component if that keeps the file readable.
4. Build `StarterTemplatesModal` with scrollable template cards and import actions.
5. Add a navbar button that opens the modal.
6. Thread the selected template from the modal to the canvas import handler.
7. Replace the active Liveblocks-synced nodes and edges with cloned template data.
8. Fit the view after import.
9. Verify import behavior, collaborator-safe state updates, preview layout, accessibility labels, and build output.

## Check When Done

- `components/editor/starter-templates.ts` exports typed template data.
- At least three templates exist: Microservices Platform, CI/CD Pipeline, and Event-Driven System.
- Template nodes use supported canvas shapes and canonical node colors.
- Template edges use the custom canvas edge type and compatible edge data.
- The workspace navbar includes an accessible starter template entry point.
- The modal renders template cards in a scrollable grid.
- Each template card includes a lightweight diagram preview.
- Importing a template replaces current canvas nodes and edges.
- Importing a template writes through existing Liveblocks-synced canvas state.
- The viewport fits to the imported template after import.
- Imported nodes and edges remain editable with existing canvas tools.
- No template API, database model, or persistence layer is added.
- `npm run build` passes without type errors.

## Acceptance Criteria

- A user can open the starter template library from the editor workspace.
- A user can choose one of at least three useful system design templates.
- The modal previews help the user distinguish templates before importing.
- Selecting a template replaces the active canvas graph with the selected diagram.
- Collaborators in the same room see the imported template through shared canvas state.
- The imported graph uses the same node and edge contracts as manually created diagrams.
- The implementation remains static, client-side, and within the existing canvas architecture.
- Build succeeds.
