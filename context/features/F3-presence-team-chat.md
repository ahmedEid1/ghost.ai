Consolidated spec for Feature 3 — Presence & Team Chat.
Covers the work documented in feature-specs 19, 24, and 25.

## What This Feature Delivers

Real-time awareness of who is in the room — including the Ghost AI agent — plus a persistent shared chat feed accessible from the sidebar.

### Live Cursors

- `LiveCursorLayer` is a React Flow child component that reads `useViewport` to transform flow-space cursor coordinates into container-relative pixel positions.
- Renders a pointer glyph SVG + colored name badge per other participant.
- When a participant's `presence.thinking` is true, the badge shows an inline SVG dashed spinner.

### Presence Cluster

- `PresenceCluster` is an absolute top-right overlay inside the canvas wrapper.
- Overlapping avatar stack (up to 5 collaborators, +N overflow chip) separated by a divider from the Clerk `UserButton` for the current user.
- Ghost AI collaborator (`ghost-ai:<projectId>`) gets a distinct bot avatar with an animated dashed ring while `thinking` is true.
- `canvas.tsx` maps `o.presence.thinking` and the Ghost AI ID convention into both the cursor layer and the cluster.

### AI Activity Validation

- `types/ai-status.ts` — `parseAiStatusEvent` guards all incoming `AI_STATUS` room events before they reach UI state.
- `hooks/use-ai-activity-state.ts` — centralizes derived AI activity (`isActive`, `phase`, `message`, `activeRunId`, `latestStatus`) with correct leading-run replacement logic.
- `AiSidebar` renders a compact `Working` spinner badge in the tab bar while `isActive`.

### Room Chat Feed

- Liveblocks room-scoped feed `ai-chat` created idempotently on mount via `useCreateFeed`.
- `types/chat.ts` — `parseChatMessage` validates kind, role, senderId, senderName, and content (trimmed, 2000-char cap) before rendering.
- `RoomChatTab` — `useFeedMessages("ai-chat")` subscription with auto-scroll-to-bottom and user-scroll detection; grouped bubbles distinguishing own vs. others; hover timestamp; empty/loading/error states.
- Composer with client-generated stable IDs, content-length enforcement, and send-in-flight lock.
- AI assistant messages rendered with Bot icon and a distinct left-aligned bubble style.

## Key Files

- `components/editor/live-cursor-layer.tsx` — per-participant cursor + thinking badge
- `components/editor/presence-cluster.tsx` — avatar stack with Ghost AI indicator
- `components/editor/room-chat-tab.tsx` — chat feed UI and composer
- `hooks/use-ai-activity-state.ts` — derived AI run state
- `types/ai-status.ts` — `parseAiStatusEvent` validator
- `types/chat.ts` — `parseChatMessage` validator
- `liveblocks.config.ts` — `AiChatFeedMetadata`, `AiChatFeedMessageData`, `FeedMetadata`, `FeedMessageData`

## Detailed Specs

See `context/feature-specs/`: 19, 24, 25

## Check When Done

- Opening the same project in two browsers shows both cursors moving in real time.
- Ghost AI bot avatar appears in the cluster while a design task is running and shows the thinking ring.
- Chat tab sends and receives messages; messages persist across page refreshes.
- AI assistant replies appear with the Bot icon style.
- Malformed chat payloads are rejected before rendering.
- `npm run build` passes.
