Prisma is already installed. Add the project data models. Prisma client singleton, and first migration.

## Models

Create `prisma/schema.prisma` with the following content:

Add `Project`:

- owner ID which maps to Clerk user ID
- name
- optional description
- status enum: (DRAFT, ACTIVE, ARCHIVED)
- `canvasJsonPath` for future canvas BLOB storage
- timestamps
- indexs on owner ID + createdAt for efficient querying of user projects sorted by creation date


Add `ProjectCollaborator`:

- project relation with cascade delete
- collaborator email
- createdAt timestamp
- unique constraint on project + email to prevent duplicate collaborators
- index on email for efficient querying of projects shared with a user by their email address
- index on date for sorting shared projects by when they were shared

Don't add any extra fields unless required by Prisma or the database. We want to keep the data model minimal and add fields later as needed.


## Prisma Client

Create `lib/prisma.ts` as a cached singleton with the following content:

Branch by `DATABASE_URL`:

- if it starts with `prisma+postgres://`, use Accelerate
- otherwise, use direct `@prisma/adapter-pg`

Cache the Prisma client instance on `global` in development to prevent multiple instances during hot reloads.

## Migration

run the migration to generate the client and create the database tables. Verify the tables are created correctly in the database.

## Dependencies

Already installed:

- `@prisma/client`
- `prisma`
- `@prisma/adapter-pg`
- `pg`

## Check when done

- schema has the models defined with the correct fields, types, relations, and indexes
- `lib/prisma.ts` exports a Prisma client instance that branches by `DATABASE_URL` and caches in development
- migration runs successfully and creates the expected tables in the database
- build and dev server run without errors after adding Prisma client code