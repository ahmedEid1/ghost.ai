Build the `/editor/[roomId]` workspace shell with server-side access checks. No canves logic yet.

## Access 

- `/editor/[roomId]` must be a server component that checks if the user has access to the room. If not, it should return a 404 or redirect to an error page.
- If the user has access, it should render the workspace shell with a placeholder for the canvas component.

Before rendering:

- unauthenticated users should be redirected to the login page.
- authenticated users without access to the room should see a 404 page or an error message.
- non-existent room IDs should also result in a 404 page.

Create `components/editor/no-access.tsx` to display an error message for users who don't have access to the room. it should be amazingly designed and user-friendly. it should include a clear message about the lack of access and provide options for the user to navigate back to the home page. The design should be visually appealing and consistent with the overall style of the application.

## Acess Helpers

Create `lib/project-access.ts` with helper functions to check if a user has access to a project. This will be used in the server component for the editor workspace shell. The helper functions should include:
- `hasAccessToProject(userId: string, projectId: string): Promise<boolean>`: This function checks if the user has access to the specified project. It should query the database to verify if the user is a member of the project or has the necessary permissions.
- `getProjectMembers(projectId: string): Promise<string[]>`: This function retrieves a list of user IDs who are members of the specified project. It can be used to display project members in the UI or for access control purposes.
- `getUserProjects(userId: string): Promise<string[]>`: This function retrieves a list of project IDs that the specified user has access to. It can be used to display the user's projects in the UI or for access control purposes.
- `isUserProjectOwner(userId: string, projectId: string): Promise<boolean>`: This function checks if the specified user is the owner of the specified project. It can be used to determine if the user has additional permissions or access rights within the project.
- `isUserCollaborator(userId: string, projectId: string): Promise<boolean>`: This function checks if the specified user is a collaborator on the specified project. It can be used to determine if the user has access to certain features or functionalities within the project.

These helper functions will be essential for implementing access control in the editor workspace shell and ensuring that users can only access projects they have permissions for. They will also help maintain a clean and organized codebase by centralizing access-related logic in one place.

## layout

The layout of the editor workspace shell should include the following components:
- **Header**: A header component that displays the project name and provides navigation options (e.g., back to home, settings).
- **Sidebar**: A sidebar component that contains navigation links to different sections of the editor (e.g., canvas, assets, settings).
- **Main Content Area**: A main content area where the canvas component will be rendered. This area should be designed to accommodate the canvas and any additional tools or panels that may be added in the future.
- **AI Sidebar**: the AI chat sidebar on the right side of the screen, which can be toggled open or closed. This sidebar will be used for AI interactions and should be designed to provide a good user experience for chatting with the AI assistant.
- **Footer**: A footer component that can display additional information or links (optional).
The layout should be responsive and visually appealing, with a consistent design that aligns with the overall style of the application. It should also provide a user-friendly experience, allowing users to easily navigate between different sections of the editor and access the features they need.

## scope
do not implement any canvas logic or features in this task. Focus solely on building the workspace shell with access checks and the layout components. The canvas component can be implemented in a future task once the workspace shell is set up and functional.

## check when done
- [ ] The `/editor/[roomId]` workspace shell is implemented as a server component that checks user access to the room.
- [ ] Unauthenticated users are redirected to the login page when trying to access the editor workspace.
- [ ] Authenticated users without access to the room see a 404 page or an error message.
- [ ] Non-existent room IDs result in a 404 page.
- [ ] The `components/editor/no-access.tsx` component is created and displays an error message for users without access to the room.
- [ ] The `lib/project-access.ts` file is created with the specified helper functions for checking user access to projects.
- [ ] The layout of the editor workspace shell includes a header, sidebar, main content area, and optional footer, and is visually appealing and user-friendly.
- [ ] The workspace shell is responsive and provides a good user experience for navigating between different sections of the editor.
- [ ] No canvas logic or features are implemented in this task, and the focus is solely on building the workspace shell with access checks and layout components.
- [ ] The code is clean, well-organized, and follows best practices for React and Next.js development.
- [ ] The implementation is tested to ensure that access checks and layout components work as expected, and that users are properly redirected or shown error messages based on their access level.
- [ ] The design of the `no-access` component is visually appealing and consistent with the overall style of the application, providing a clear message about the lack of access and navigation options for users.
- [ ] The helper functions in `lib/project-access.ts` are properly implemented and can be used for access control in the editor workspace shell and other parts of the application as needed.
- [ ] The implementation is documented, with clear comments and explanations for the access checks, layout components, and helper functions to ensure maintainability and ease of understanding for future developers working on the project.
- [ ] The workspace shell is tested with various scenarios, including authenticated users with access, authenticated users without access, unauthenticated users, and non-existent room IDs to ensure that the access checks and error handling work correctly in all cases.
- build and test the workspace shell to ensure that it functions correctly and provides a good user experience for users accessing the editor.
