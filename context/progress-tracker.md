
Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Feature 07 — Wire Editor Home: project list fetched server-side, real API calls for create/rename/delete.

## Completed

- **Feature 01 — Design System**: shadcn/ui installed and configured; Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added to `components/ui/`; dark theme CSS custom properties set in `globals.css`; `lib/utils.ts` with `cn()` created; `lucide-react` installed.
- **Feature 02 — Editor Chrome**: `EditorNavbar` with sidebar toggle (PanelLeftOpen/Close icons); `ProjectSidebar` floating overlay with Tabs (My Projects / Shared with Me), empty states, Create New Project button; `EditorDialog` reusable wrapper around shadcn Dialog accepting title, description, footer, and children props.
- **Feature 03 — Auth**: `@clerk/ui` installed; `ClerkProvider` wraps root layout with `dark` theme from `@clerk/ui/themes` and CSS-variable overrides; `proxy.ts` at project root uses `clerkMiddleware` + `createRouteMatcher` to protect all routes except sign-in and sign-up; sign-in and sign-up pages use Clerk prebuilt components inside a 2-panel layout (logo/tagline left, form right on large screens; stacked on small screens); root `page.tsx` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`; `UserButton` added to `EditorNavbar` right section.
- **Feature 04 — Project Dialogs**: Editor home screen with heading, description, and Create/Open buttons; `useProjectDialogs` hook in `hooks/` managing dialog, form, and loading state; Create, Rename, and Delete project dialogs in `components/editor/project-dialogs.tsx`; `ProjectDialogsContext` threads `openCreateDialog` and `openSidebar` from `EditorShell` to the editor page; `ProjectSidebar` updated with mock project list, Rename/Delete actions for owned projects (hidden for shared), mobile backdrop scrim; `lib/mock-projects.ts` holds `Project` type, mock data, and `toSlug` utility.
- **Feature 05 — Prisma**: `prisma/schema.prisma` with `Project` (ownerId, name, description, status enum DRAFT/ACTIVE/ARCHIVED, canvasJsonPath, timestamps, indexes on ownerId and ownerId+createdAt) and `ProjectCollaborator` (project FK with cascade delete, collaboratorEmail, createdAt, unique on projectId+email, indexes on email and createdAt) models; `lib/prisma.ts` singleton branching by `DATABASE_URL` (Accelerate via `accelerateUrl`+`withAccelerate()` for `prisma+postgres://` URLs, direct `PrismaPg` adapter otherwise), cached on `globalThis` in development; migration `20260504154525_init` applied and tables verified in database.
- **Feature 06 — Project APIs**: `GET /api/projects` lists owned + shared projects (shared via collaboratorEmail lookup), sorted by createdAt desc, with `isOwner` flag; `POST /api/projects` creates a project defaulting name to "Untitled Project"; `PATCH /api/projects/[projectId]` updates name/description (owner only); `DELETE /api/projects/[projectId]` deletes project (owner only); all routes enforce 401 Unauthorized for unauthenticated users, 403 Forbidden for non-owners on mutations, 400 for invalid input, 500 with console logging for unexpected errors; build verified clean.
- **Feature 07 — Wire Editor Home**: `app/editor/layout.tsx` is now a server component that fetches owned + shared projects from Prisma and passes them as `initialProjects` to `EditorShell`; `lib/types.ts` defines the canonical `Project` interface (`id, name, description, status, isOwner`); `toSlug` moved to `lib/utils.ts`; `hooks/use-project-actions.ts` wraps `POST /api/projects`, `PATCH /api/projects/:id`, and `DELETE /api/projects/:id` with per-operation loading state, router navigation after create (→ `/editor/:id`) and delete (→ `/editor`); `hooks/use-project-dialogs.ts` replaced mock data with real API calls via `useProjectActions`, adds per-dialog `error` state; all three dialogs wired to display API errors inline and reflect loading; sidebar uses `isOwner` (was `owned`); build verified clean.
- **Feature 08 — Editor Workspace Shell**: `app/editor/[roomId]/page.tsx` server component with three-layer access guard (redirect unauthenticated → 404 non-existent → NoAccess unauthorized); `lib/project-access.ts` with five helpers (`hasAccessToProject`, `getProjectMembers`, `getUserProjects`, `isUserProjectOwner`, `isUserCollaborator`) using Prisma + Clerk `currentUser()` for collaborator email lookups; `components/editor/no-access.tsx` full-screen error UI with ShieldOff icon, clear messaging, and back-to-projects actions; `components/editor/workspace-shell.tsx` client wrapper managing AI sidebar state; `components/editor/workspace-navbar.tsx` project breadcrumb bar with name, status badge, AI toggle, and placeholder share/settings buttons; `components/editor/workspace-sidebar.tsx` narrow icon sidebar (Canvas / Assets / Settings); `components/editor/ai-sidebar.tsx` right slide-over AI panel with empty state and disabled input (AI generation deferred); canvas area shows dot-grid placeholder; build verified clean.

- **Feature 09 — Share Dialog**: `GET/POST /api/projects/[projectId]/collaborators` and `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]` routes enforce auth and owner-only mutations; Clerk `clerkClient` used to resolve collaborator emails to display names and avatars; `ShareDialog` client component with invite form, animated copy-link button, skeleton loading, and per-member remove controls; `WorkspaceNavbar` Share button wired to open dialog; `EditorShell` hosts a second instance of `ShareDialog` triggered from the per-project Share icon in `ProjectSidebar`; `Avatar`/`Badge` shadcn components added; build verified clean.

## In Progress

- None.

## Next Up

- Feature 10 (TBD per feature-specs).

## Open Questions

- None.

## Architecture Decisions

- Using Tailwind v4 with CSS-variable-based theming via `@theme inline` in `globals.css`.
- shadcn/ui components live in `components/ui/` and must not be modified after generation.
- Dark-only: all color tokens are on `:root`, no `.dark` class toggle needed.
- Clerk route protection is implemented in `proxy.ts` (Next.js 16 renamed middleware → proxy). `middleware.ts` is not used.
- Public routes are resolved at runtime from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars.

## Session Notes

- All color tokens defined as CSS custom properties in `globals.css` and mapped via `@theme inline`. Components must use token-based utility classes, not raw Tailwind color classes or hardcoded hex values.
- shadcn semantic tokens (`--background`, `--foreground`, etc.) are wired directly to the dark theme hex values in `:root`.
- Clerk `Appearance` type (from `@clerk/ui`) uses `theme` (not `baseTheme`) to set a base theme, and `variables` for CSS-variable overrides.
