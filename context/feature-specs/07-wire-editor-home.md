Wire the editor sidebar and project dialogs to the real backend APIs. Implement the frontend logic to create, list, update, and delete projects through the API routes.

## Data Fetching

The editor home page is a server component that fetches the list of projects for the authenticated user from the `GET /api/projects` route and passes it to the `ProjectSidebar` as props.

No client-side data fetching for initial load. The project list is rendered from server props.

## `Use Project Actions` hook

Create a `useProjectActions` hook in `hooks/` that provides functions to call the project API routes for creating, updating, and deleting projects. This hook will be used by the project dialogs and sidebar actions.

#### Create Project
- manage loading state while the API request is in progress
- call `POST /api/projects` with the project name and optional description
- return the created project data (ID, name, description, status, isOwner)
- navigate to the editor page for the new project after creation (e.g. `/editor/${projectId}`)

#### Update Project
- manage loading state while the API request is in progress
- call `PATCH /api/projects/:projectId` with the updated name and/or description
- return the updated project data (ID, name, description, status, isOwner)
- update the project list in the sidebar with the new data after a successful update

#### Delete Project
- manage loading state while the API request is in progress
- call `DELETE /api/projects/:projectId`
- return success status or message
- navigate back to the editor home page after deletion (e.g. `/editor`)
- update the project list in the sidebar to remove the deleted project after a successful deletion


The project ID and Liveblock room id should stay aligned.


### Wiring

Connect the hook to the sidebar and dialogs:

- create dialog shows the room-id preview
- rename dialog updates the project name in the sidebar after renaming and pre-fills the current name in the input
- delete dialog removes the project from the sidebar after deletion
- sidebar actions call the update and delete functions from the hook and handle navigation after the operations complete.
- ensure loading states are reflected in the UI (e.g. disable buttons while loading, show spinner if desired).
- handle and display any errors that occur during API calls (e.g. show a toast notification or error message in the dialog).
- verify that the project list in the sidebar updates correctly after each operation (create, rename, delete) without needing to refresh the page.

## Check when done
- Sidebar lists projects fetched from the API with correct data (name, description, status).
- Create project dialog creates a new project through the API and navigates to the editor page for that project.
- Rename project dialog updates the project name through the API and reflects the change in the sidebar.
- Delete project dialog deletes the project through the API and removes it from the sidebar, navigating back to the editor home page.
- Loading states are handled correctly in the UI during API calls.
- Errors from API calls are handled and displayed appropriately in the UI.
- Build and dev server run without errors after adding the API integration code.
- Verify that the project ID and Liveblock room ID remain aligned after creating a new project.
- Test the full flow of creating, renaming, and deleting projects to ensure the frontend and backend are working together correctly.
- Verify that the project list updates in real-time in the sidebar after each operation without needing a page refresh.
- Ensure that only the authenticated user's projects are listed in the sidebar and that shared projects are displayed with the correct ownership status.
- Verify that navigation after each operation (create, rename, delete) goes to the correct pages (editor page for created project, back to editor home after deletion).
- Test edge cases such as API errors, network issues, and invalid input to ensure the UI handles these scenarios gracefully.
- Ensure that the project dialogs are properly closed after successful operations and that the UI state is consistent (e.g. no stale data in the sidebar after renaming or deleting a project).

