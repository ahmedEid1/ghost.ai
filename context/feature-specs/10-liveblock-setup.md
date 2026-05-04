Setup the realtime collaboration features of Liveblocks in your app.

## Configuration

Configure the `liveblocks.config.ts` file at the root of the project.

Define

### Presence

- Cursor position
- `isThinking` boolean

### User Metadata

- User ID
- display name
- avatar URL    
- cursor color

## Liveblocks Client

Create a cached Liveblocks client in `lib/liveblocks.ts`.

Add a helper function to determinstically generate a cursor color from the user ID from a predefined list of colors.

## Auth Route

Create an API route at `POST /api/liveblocks-auth` that accepts the user metadata and returns an authentication token for Liveblocks.

Use the Project ID as the liveblocks room id.

This route must:
- require authentication (redirect to login if not authenticated)
- validate the request body (ensure all required fields are present and valid)
- verify the user is authorized to access the specified room (if necessary)
- ensure the user ID in the request body matches the authenticated user's ID (to prevent impersonation)
- generate a Liveblocks authentication token using the Liveblocks client and the provided user metadata
- return the authentication token in the response
- handle errors gracefully, returning appropriate HTTP status codes and error messages for different failure scenarios (e.g., missing fields, unauthorized access, token generation failure)
-  makse sure user has access to the specified room (ownership or membership)

return `403 Forbidden` if the user is not authenticated or does not have access to the specified room.

## Dependencies
All required Liveblocks packages are already installed.

### Checks when done
- [ ] `liveblocks.config.ts` is properly configured with the presence and user metadata fields.
- [ ] A cached Liveblocks client is created in `lib/liveblocks.ts` with a helper function to generate cursor colors.
- [ ] An API route at `POST /api/liveblocks-auth` is implemented that validates the request, checks user authorization, generates a Liveblocks authentication token, and returns it in the response.
- [ ] The API route properly handles errors and returns appropriate HTTP status codes and messages for different failure scenarios.
- [ ] The API route ensures that only authenticated users with access to the specified room can obtain an authentication token, returning `403 Forbidden` for unauthorized access.
- [ ] The implementation is tested to ensure that the realtime collaboration features of Liveblocks are functional in the app.
- [ ] The code is reviewed and approved by the team, ensuring it meets the project's coding standards and requirements.
- [ ] Documentation is updated to reflect the new Liveblocks setup and usage instructions for developers working on the project.
- [ ] The implementation is deployed to a staging environment for further testing before going live.
- [ ] Any necessary adjustments or bug fixes are made based on testing feedback, ensuring a smooth user experience with the realtime collaboration features of Liveblocks.
