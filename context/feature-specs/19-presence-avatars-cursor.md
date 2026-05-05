# Feature 19 - Presence Avatars and Custom Cursors

Add an in-canvas collaborator presence surface for room participants and upgrade cursor visuals so collaboration is immediately visible during editing.

## Goal

Improve collaboration awareness in the editor room without changing global navigation behavior.

This feature delivers two things inside the canvas workspace only:

1. A top-right participant cluster that shows collaborators plus the current user.
2. Live colored cursors for other participants with readable name badges.

## Dependencies and Existing Contracts

- The editor room shell is rendered by components/editor/workspace-shell.tsx.
- The room navbar is rendered by components/editor/workspace-navbar.tsx.
- The collaborative canvas is rendered by components/editor/canvas.tsx.
- Clerk auth state is available via useUser from @clerk/nextjs.
- Liveblocks room presence is already active through RoomProvider and useLiveblocksFlow.
- Existing generic cursor rendering is currently provided by Cursors from @liveblocks/react-flow.
- User metadata for collaborators comes from liveblocks-auth and includes displayName, avatarUrl, and cursorColor.

Do not change project access, room auth issuance, node behavior, edge behavior, template import, or history ergonomics.

## User Experience

### 1) Presence Cluster Placement

Render the participant cluster inside the canvas surface, not in shared/global navbar chrome.

Requirements:

- Place it at the top-right corner of the canvas viewport.
- Keep it visually detached from workspace navbar action buttons.
- Keep it visible while panning/zooming the canvas content.
- Keep it usable when the AI sidebar is open.
- Use the existing dark token-based style system from ui-context.md.

### 2) Participant Composition Rules

The cluster has two zones:

1. Collaborator avatar stack (Liveblocks participants except current user).
2. Current user avatar control via Clerk UserButton.

Rules:

- Resolve current user from active Clerk session (useUser).
- Exclude any Liveblocks participant whose user ID equals the current Clerk user ID.
- Render collaborators as display-only avatars (not buttons, no menus, no click actions).
- Render the current user only once via Clerk UserButton.
- Keep collaborator avatars and UserButton the same visual size.
- Show a vertical divider only when collaborator count is greater than zero.
- When no collaborators are present, show only UserButton and no divider.

### 3) Collaborator Avatar Rendering

- Use profile image when available.
- Fall back to initials from displayName when image is missing.
- Show at most five collaborator avatars in an overlapping stack.
- For overflow, render a compact +N chip where N is remaining collaborators.
- Add a subtle ring so avatars remain readable on the dark canvas.
- Maintain deterministic stack order for visual stability across renders.

## Cursor Experience

### 1) Broadcasting Presence Cursor

- Broadcast local pointer coordinates through Liveblocks presence.
- Update cursor on React Flow pane mouse move.
- Clear cursor to null when pointer leaves the canvas pane.
- Cursor updates must not interfere with node dragging, connecting, or selection.

### 2) Rendering Other Users' Cursors

- Render cursors for other participants only; never render the local user cursor.
- Each cursor includes:
  - a small pointer glyph
  - an attached name badge
- Pointer and badge color use each participant cursorColor.
- Name uses participant displayName with a safe fallback.
- Cursor layer should be non-interactive (pointer-events none).

Implementation direction:

- Replace generic Cursors usage with a project-owned cursor layer component so avatar and color behavior remain consistent with product styling and future thinking-state UI.

## Presence Type Contract

Define a single canonical presence shape in liveblocks.config.ts:

```ts
Presence: {
  cursor: { x: number; y: number } | null;
  thinking: boolean;
}
```

Naming decision:

- Use thinking as the canonical field name.
- Remove legacy isThinking references in room initialPresence and related code.
- If transitional compatibility is needed during rollout, read both fields temporarily but write only thinking.

## Functional Requirements

### 1) New UI Components

Add focused components under components/editor/:

- presence-cluster.tsx: top-right avatar group and current user UserButton composition.
- live-cursor-layer.tsx: custom collaborator cursor rendering.

These components should stay presentational and consume pre-shaped participant data passed from canvas/container logic.

### 2) Canvas Wiring

In components/editor/canvas.tsx:

- Subscribe to Liveblocks others and local presence update APIs.
- Derive collaborator list with explicit current-user filtering.
- Wire onPaneMouseMove and onPaneMouseLeave to updateMyPresence cursor.
- Render custom cursor layer over React Flow.
- Render presence cluster as an absolute top-right overlay.

### 3) Data Mapping Rules

For each participant, normalize:

- id: string
- displayName: string
- avatarUrl: string | null
- cursorColor: string
- cursor: { x: number; y: number } | null

Fallbacks:

- displayName fallback: Collaborator
- initials fallback: first non-empty characters from displayName
- cursorColor fallback: token-safe accent color when metadata is absent

## Accessibility Requirements

- Presence cluster must have an accessible group label.
- Overflow chip must include accessible text indicating hidden participant count.
- UserButton accessibility behavior remains owned by Clerk.
- Cursor labels must preserve contrast on dark surfaces.
- Presence overlays must not trap focus.

## Edge Cases

- Current user not loaded yet: render nothing or safe skeleton until Clerk session is ready.
- Participant without avatarUrl: initials fallback is shown.
- Participant without displayName: use Collaborator label.
- More than five collaborators: show +N overflow chip.
- All collaborators leave: divider disappears and only UserButton remains.
- Cursor stream temporarily missing: do not render ghost cursor.
- Canvas resize or sidebar toggle: overlays stay anchored top-right and cursor coordinates remain visually aligned.

## Scope Limits

- Do not add participant avatars to editor home navbar.
- Do not redesign workspace navbar layout.
- Do not remove existing navbar actions.
- Do not replace Clerk profile/logout behavior.
- Do not make collaborator avatars interactive.
- Do not modify node and edge feature behavior.
- Do not introduce new API routes or database schema changes.

## Implementation Plan

1. Normalize Presence typing in liveblocks.config.ts from isThinking to thinking.
2. Add presence cluster and custom cursor layer components in components/editor/.
3. Replace generic Cursors rendering with custom live cursor layer.
4. Wire cursor broadcasting through React Flow pane mouse events.
5. Wire top-right collaborator cluster with explicit self-filtering and overflow logic.
6. Validate no regressions in toolbar/shape/edge interactions.
7. Run npm run build.

## Check When Done

- Presence UI appears only inside editor room canvas view.
- Editor home navbar remains unchanged.
- Current user is sourced from active Clerk session.
- Collaborator avatars exclude current user.
- Divider appears only when collaborators exist.
- Avatar stack caps at five with +N overflow.
- Cursor position broadcasts through Liveblocks presence updates.
- Custom cursor layer renders other participants only.
- Presence type uses thinking, not isThinking.
- npm run build passes.

## Acceptance Criteria

- In a multi-user room, users can immediately identify active collaborators from the top-right avatar cluster.
- The current user is represented by Clerk UserButton and not duplicated in collaborator avatars.
- Collaborator cursors appear in real time with participant color and name badge.
- Presence overlays integrate with existing editor UX without altering navbar or canvas editing behavior.
- Build succeeds with no type errors.