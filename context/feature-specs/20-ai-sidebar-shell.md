# Feature 20 - AI Sidebar Shell

Replace the current AI placeholder with a production-ready sidebar shell UI for chat and spec workflows while preserving the existing right-side floating slide behavior and parent-controlled visibility.

## Goal

Deliver a complete, polished sidebar interface that feels native to the editor workspace and is ready to receive real AI wiring in a later feature.

This unit focuses on structure and interaction affordances only:

1. Sidebar shell and header polish.
2. Tabbed layout for AI Architect and Specs.
3. Rich empty and demo states.
4. Composer ergonomics (auto-resize and keyboard submit behavior).

## Dependencies and Existing Contracts

- Sidebar open/close state is controlled by the parent workspace shell.
- Existing slide-in behavior, right-side placement, and floating visual treatment are already part of the shell and must remain intact.
- The sidebar component remains a client component.
- Use shadcn primitives already present in the project (`Button`, `Tabs`, `Textarea`, `ScrollArea` when needed).
- Use only token-based classes/variables defined in global theme mapping.

Do not introduce API calls, Liveblocks logic, AI generation, or data persistence in this feature.

## User Experience

### 1) Shell and Placement

Keep the current sidebar behavior and placement model:

- Parent owns `isOpen` and `onClose`.
- Sidebar remains right-aligned and smoothly slides in/out.
- Preserve existing border/background/shadow intent.
- Use token-driven surface treatment such as `bg-base/95`, `border-surface-border`, and established workspace shadow style.

### 2) Header

Create a compact header with clear hierarchy:

- Left section:
   - bot icon
   - title: `AI Workspace`
   - subtitle: `Collaborate with Ghost AI`
- Right section:
   - close button icon

Typography and color:

- Title uses primary text token (`text-text-primary` in current mapping).
- Subtitle uses muted text token (`text-text-muted` in current mapping).

### 3) Tabs

Use shadcn `Tabs` with two triggers:

- `AI Architect`
- `Specs`

State styling:

- Active tab: accent surface/text treatment (`bg-accent-primary-dim`, accent text token).
- Inactive tab: muted text token.

Tab switching is local UI state only.

## Functional Requirements

### 1) Component Structure

Keep `AiSidebar` as the top-level shell and split internal UI into small feature-focused pieces to avoid a monolithic component.

Suggested internal subcomponents (same folder):

- `AiSidebarHeader`
- `AiArchitectTab`
- `SpecsTab`
- optional `StarterPromptChip` and `ChatBubble`

The exact file split can vary, but responsibilities must be clear and maintainable.

### 2) AI Architect Tab

Build a chat-first panel with three states: empty seed UI, demo conversation rendering, and composer.

#### Chat Area

- Scrollable body region.
- When message list is empty, show an empty state panel with:
   - bot icon
   - short explanatory text
   - starter prompt chips

Starter chips (exact labels):

- `Design an e-commerce backend`
- `Create a chat app architecture`
- `Build a CI/CD pipeline`

Starter chip styling:

- soft pill surface (`bg-subtle`)
- accent/muted readable text token (prefer current accent text mapping)
- subtle border consistent with surface tokens

Chip behavior for this feature:

- Clicking a chip pre-fills composer input.
- No network call or generation action.

#### Message Bubble Styles

Render static/local messages with visual distinction:

- User messages:
   - right-aligned
   - `bg-accent-primary-dim`
   - token border equivalent of brand/primary accent at subtle opacity
   - readable primary text
- Assistant messages:
   - left-aligned
   - `bg-elevated`
   - `border border-surface-border`
   - accent/secondary readable text

Keep max bubble width constrained for readability.

#### Composer

Bottom composer requirements:

- Auto-resizing textarea
- minimum height around `72px`
- maximum height around `160px`
- send button with accent fill + white text
- `Enter` submits
- `Shift+Enter` inserts newline

Submission behavior for this feature:

- Local-only submit handler (append to local demo messages or no-op placeholder)
- Trim whitespace-only input and block empty submits
- Keep focus in textarea after submit

### 3) Specs Tab

Provide a lightweight static shell for future spec workflow.

Requirements:

- Top action button: `Generate Spec` with accent filled style and white text.
- Demo spec card beneath button:
   - elevated surface (`bg-elevated`)
   - default border token (`border-surface-border`)
   - spec/file icon
   - title
   - short snippet/preview text
   - disabled download action (button disabled)

This tab is UI-only; no generation or file actions.

## Interaction Details

- Escape behavior remains owned by existing close-button flow unless already handled globally.
- Sidebar content should not cause layout shift in the canvas surface beyond existing shell behavior.
- Internal scrolling should stay inside tab panels, not the full page.
- Sticky composer/footer behavior is acceptable if it improves usability.

## Styling Rules

- Use existing project design tokens only.
- Do not hardcode new hex values.
- Prefer established token utility names already used in editor components.
- Maintain current radius scale (`rounded-xl`/`rounded-2xl`) and dark workspace language.

## Scope Limits

- Do not rebuild open/close state ownership.
- Do not replace slide animation or shell placement behavior.
- Do not add backend logic.
- Do not add Liveblocks presence/chat behavior.
- Do not add AI generation logic.
- Do not add spec generation logic.
- Do not alter workspace navbar behavior.

## Accessibility Requirements

- Tab triggers must be keyboard accessible and visibly focusable.
- Icon-only buttons (close, send, disabled download) must have `aria-label`.
- Message region should be readable with sufficient token-based contrast.
- Disabled actions must use native `disabled` state where possible.
- Textarea must retain clear focus indication.

## Edge Cases

- Very long draft text should scroll inside textarea once max height is reached.
- Enter key submit should not fire during IME composition.
- Shift+Enter always creates newline.
- Empty/whitespace message does not submit.
- Long starter chip labels should wrap cleanly on small widths.
- Specs tab card remains visually stable with long title/snippet content (truncate or clamp).

## Implementation Plan

1. Keep top-level `AiSidebar` shell contract (`isOpen`, `onClose`) unchanged.
2. Build polished header with title/subtitle/icon/close action.
3. Add shadcn `Tabs` scaffold with `AI Architect` and `Specs`.
4. Implement `AI Architect` empty state, starter chips, message list styles, and composer interactions.
5. Implement `Specs` tab with generate button and static demo spec card.
6. Verify token-only styling and no regression in sidebar slide/placement behavior.
7. Run `npm run build`.

## Check When Done

- AI sidebar remains parent-controlled and preserves existing floating slide-in behavior.
- Header shows `AI Workspace` and `Collaborate with Ghost AI` with close action.
- Tabs render and switch between `AI Architect` and `Specs`.
- AI Architect includes scrollable chat area, empty state, starter chips, and composer.
- Composer auto-resizes between ~72px and ~160px and supports Enter/Shift+Enter behavior.
- Specs tab shows `Generate Spec` and a static demo spec card with disabled download action.
- No backend or AI runtime logic was added.
- `npm run build` passes.

## Acceptance Criteria

- The sidebar feels like a complete feature shell rather than a placeholder.
- Users can draft prompts comfortably in the composer.
- Users can discover future spec flow from the Specs tab UI.
- Styling remains consistent with the dark token-based editor system.
- The implementation is ready for later AI/spec wiring without structural rework.