The database schema is ready. Build the backend to Project Apis routes only.

## Routes


Create RESTful API routes for:

- `GET /api/projects`: list projects for the authenticated user, including owned and shared projects, sorted by creation date descending. Include project ID, name, description, status, and ownership flag (isOwner).
- `POST /api/projects`: create a new project owned by the authenticated user. Accept name and optional description in the request body. Return the created project's ID, name, description, status, and ownership flag.
- `PATCH /api/projects/:projectId`: update a project's name and/or description. Only the project owner can update. Accept name and/or description in the request body. Return the updated project's ID, name, description, status, and ownership flag.
- `DELETE /api/projects/:projectId`: delete a project. Only the project owner can delete. Return a success message or status.


## Rules

Use the authenticated clerk user ID as `ownerId`.

When creating:

- deffault name to "Untitled Project" if not provided
- Use the schema's existing ID Strategy, don't generate your own IDs.

When listing projects, include both owned and shared projects. For shared projects, set `isOwner` to false in the response.

When updating or deleting, verify that the authenticated user is the owner of the project. If not, return a 403 Forbidden error.

## Security

- unauthenticated users should receive a 401 Unauthorized error
- users who are not the owner of a project should receive a 403 Forbidden error when trying to update or delete a project.
- users should not be able to access projects they don't own or that aren't shared with them in the list endpoint.
- validate request body data and return 400 Bad Request for invalid input (e.g. missing required fields, invalid field types).
- handle unexpected errors with a 500 Internal Server Error response and log the error details for debugging.

Keep this backend only. Don't implement any frontend integration yet. We'll connect the frontend to these APIs in a later feature.

## Check when done

- All routes are implemented with the correct HTTP methods and paths.
- Routes perform the correct database operations using Prisma and return the expected responses.
- Authentication and authorization rules are correctly enforced.
- Input validation is implemented and returns appropriate error responses.
- Error handling is implemented for unexpected errors.
- Test the routes using a tool like Postman or curl to verify they work as expected with different scenarios (valid requests, invalid requests, unauthorized access, etc.).
- Build and dev server run without errors after adding the API route code.
- Prisma client is used correctly in the API routes to interact with the database.