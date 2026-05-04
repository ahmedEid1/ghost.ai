Add a `Share` Dialog to the project sidebar, allowing users to share their projects with others via email. The dialog should include an input field for entering email addresses.

Owner can:
- invite others to collaborate on the project by entering their email addresses.
- manage existing collaborators, including changing their permissions or removing them from the project.
- remove collaborators from the project.
- copy the project link to share it with others with a single click and copied feedback in the UI styled in the best way possible.

Collaborators can:
- view the project and its contents.
- view the list of collaborators.
- not have the ability to invite others or manage existing collaborators.

## Clerk User Data:

Collaborators are stored by emails in the database.
Use Cleck backend API to fetch collaborators information and create a better ui that have their display names and profile pictures if available.

If the email isn't associated with a Clerk user, display the email address as is in the collaborators list.

## UI/UX Considerations:
- The `Share` Dialog should be easily accessible from the project sidebar.
- The dialog should have a clean and intuitive design, making it easy for users to understand how to share their projects and manage collaborators.
- Provide clear feedback to users when they successfully share a project or manage collaborators, such as confirmation messages or visual indicators.
- Ensure that the dialog is responsive and works well on different screen sizes, including mobile devices.
- Consider implementing a search or filter feature within the collaborators list to help users quickly find specific collaborators, especially for projects with many collaborators.
- Include appropriate error handling and validation for email input, such as checking for valid email formats and providing feedback for invalid entries.
- Ensure that the permissions management interface is straightforward, allowing owners to easily change collaborator permissions or remove collaborators without confusion.
- Provide a clear distinction between owners and collaborators in the UI, such as using different icons or labels to indicate their roles.

## Implementation Steps:
Add the required API endpoints to the backend to handle sharing functionality, including 
- inviting collaborators by email
- fetching the list of collaborators for a project
- deleting collaborators from a project

Enforce permissions on the backend to ensure that only owners can 
manage collaborators and that collaborators have read-only access.

Implement the frontend components for the `Share` Dialog, including:
- An input field for entering email addresses to invite collaborators.
- A list of current collaborators with their display names, profile pictures (if available), and their permissions.
- Buttons or controls for managing collaborators, such as removing them from the project.

Don't add a local user table to the database, instead use the Clerk API to fetch user information based on email addresses. This will allow you to display user details without needing to manage a separate user database.

## check when done:
- [ ] The `Share` Dialog is accessible from the project sidebar.
- [ ] Owners can invite collaborators by entering their email addresses.
- [ ] Owners can manage existing collaborators, including changing their permissions or removing them from the project.
- [ ] Collaborators can view the project and its contents but cannot manage collaborators.
- [ ] The project link can be copied with a single click, and feedback is provided in the UI.
- [ ] Collaborators are displayed with their display names and profile pictures if available, or their email addresses if not associated with a Clerk user.
- [ ] The UI is responsive and provides clear feedback for user actions.
- [ ] Appropriate error handling and validation are implemented for email input.
- [ ] the permissions management interface is straightforward and easy to use.
- [ ] The distinction between owners and collaborators is clear in the UI.
- [ ] Backend API endpoints are implemented to handle sharing functionality and enforce permissions correctly.
- [ ] The feature is tested to ensure it works as expected and does not introduce any bugs or issues in the application.
- [ ] The implementation follows best practices for security, ensuring that only authorized users can manage collaborators and access project information.
- [ ] The code is well-documented, making it easy for other developers to understand and maintain the sharing functionality in the future.
