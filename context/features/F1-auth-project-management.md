Consolidated spec for Feature 1 — Auth & Project Management.
Covers the work documented in feature-specs 01 through 09.

## What This Feature Delivers

A fully authenticated multi-project workspace with owner and collaborator access.

- Sign-in / sign-up pages with Clerk prebuilt components inside a two-panel layout.
- Route protection via `proxy.ts` using `clerkMiddleware` + `createRouteMatcher`.
- Root redirect: authenticated → `/editor`, unauthenticated → `/sign-in`.
- Project list sidebar (My Projects / Shared with Me tabs) with Create, Rename, and Delete dialogs wired to real APIs.
- Project CRUD routes: `GET/POST /api/projects`, `PATCH/DELETE /api/projects/[projectId]`.
- Collaborator invite by email: `GET/POST /api/projects/[projectId]/collaborators`, per-member remove.
- Clerk `clerkClient` resolves collaborator emails to display names and avatars in the Share dialog.
- Three-layer workspace access guard: unauthenticated → 404 not found → `NoAccess` screen.
- `lib/project-access.ts` with five helpers used by every protected route and server component.
- Prisma schema: `Project` (owner, name, description, status enum, canvasJsonPath) + `ProjectCollaborator` (cascade delete, unique on projectId+email).

## Key Files

- `proxy.ts` — Clerk middleware
- `app/(auth)/sign-in`, `app/(auth)/sign-up` — auth pages
- `app/editor/layout.tsx` — server component, fetches initial project list
- `app/editor/[roomId]/page.tsx` — workspace entry with access guard
- `lib/project-access.ts` — access helpers
- `hooks/use-project-actions.ts` — CRUD with per-operation loading state
- `components/editor/workspace-navbar.tsx` — Share button entry point
- `components/editor/project-dialogs.tsx` — Create / Rename / Delete dialogs
- `prisma/schema.prisma` — Project + ProjectCollaborator models

## Detailed Specs

See `context/feature-specs/`: 01, 02, 03, 04, 05, 06, 07, 08, 09

## Check When Done

- Sign-in gate redirects unauthenticated users.
- Owner can create, rename, and delete projects.
- Owner can invite a collaborator by email; collaborator sees the project under "Shared with Me".
- Owner can remove a collaborator.
- Non-owner cannot rename or delete; workspace shows NoAccess for unauthorized access.
- `npm run build` passes.
