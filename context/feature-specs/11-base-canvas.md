Replace the canvas placeholder with a Liveblocks-backed React Flow canvas. This will be the foundation for all of our collaborative features, and will allow us to build the rest of the functionality on top of a real-time shared canvas.

## Implementation

1. Keep the workspace page server-side. The Liveblocks provider and React Flow canvas will be client components inside the workspace, but the page itself can still fetch project data and enforce access guards server-side for better performance and security.

2. Create a client-side editor/canvas wrapper that sets up the Liveblocks room. it should fetch an auth token from `/api/liveblocks-auth` and use that to connect to the Liveblocks room for the current project. The initial presence should include a `cursor` field set to `null`. Use `ClientSideSuspense` to handle the loading state while connecting, and add an error fallback for any connection issues.

   It should include:
   - `LiveblocksProvider` using `/api/liveblocks-auth`
   - `RoomProvider` using the current room ID
   - initial presence with `cursor: null`
   - `ClientSideSuspense` with a simple loading state
   - an error fallback for Liveblocks connection issues
   - a wrapper for the React Flow canvas
   - export this as `Canvas` and use it in the workspace page
   - make sure to handle the case where the Liveblocks auth token cannot be obtained (e.g. user not authenticated, user doesn't have access to the room) and display an appropriate message in the error fallback
   - ensure that the Liveblocks connection is properly cleaned up when the component unmounts to prevent memory leaks or lingering connections

3. Wire React Flow to Liveblocks state.
   - use `useLiveblocksFlow`
   - enable suspense
   - start with empty nodes and edges
   - pass the synced nodes, edges, and change handlers into `ReactFlow`
   - make sure to handle the case where the Liveblocks connection is lost while the user is interacting with the canvas, and display an appropriate message or UI state to indicate that the connection has been lost and changes may not be saved
   - ensure that changes to the canvas are properly synced across all connected clients in real-time, and that any conflicts are handled gracefully (e.g. if two users try to move the same node at the same time)
   - consider implementing optimistic updates to provide a smoother user experience, where changes are immediately reflected in the UI while the Liveblocks state is being updated in the background


4. Add shared canvas types in `types/canvas.ts`.

   Node data should support:
   - label
   - color
   - shape

   Also define the custom node and edge types:
   - `canvasNode`
   - `canvasEdge`

5. Render the basic canvas.

   Include:
   - loose connection behavior
   - `fitView`
   - `MiniMap`
   - dot-pattern background

## Scope Limits

- don’t add controls yet
- don’t add custom node or edge rendering yet
- don’t add persistence logic
- don’t add AI behavior
- keep this focused on the collaborative canvas foundation

## Check When Done

- Client canvas wrapper sets up the Liveblocks room.
- React Flow uses Liveblocks-synced nodes and edges.
- Shared canvas types exist in `types/canvas.ts`.
- `npm run build` passes.
- The canvas renders with the specified features (loose connection behavior, `fitView`, `MiniMap`, dot-pattern background).
- The canvas is collaborative, with changes syncing in real-time across multiple clients.
- The implementation is tested to ensure that the realtime collaboration features of Liveblocks are functional in the app.
- The code is reviewed and approved by the team, ensuring it meets the project's coding standards and requirements.
- Documentation is updated to reflect the new Liveblocks canvas implementation and usage instructions for developers working on the project.
- Any necessary adjustments or bug fixes are made based on testing feedback, ensuring a smooth user experience with the realtime collaboration features of Liveblocks on the canvas.