
Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Feature 04 — Project Dialogs: editor home screen, Create/Rename/Delete project dialogs, sidebar actions.

## Completed

- **Feature 01 — Design System**: shadcn/ui installed and configured; Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added to `components/ui/`; dark theme CSS custom properties set in `globals.css`; `lib/utils.ts` with `cn()` created; `lucide-react` installed.
- **Feature 02 — Editor Chrome**: `EditorNavbar` with sidebar toggle (PanelLeftOpen/Close icons); `ProjectSidebar` floating overlay with Tabs (My Projects / Shared with Me), empty states, Create New Project button; `EditorDialog` reusable wrapper around shadcn Dialog accepting title, description, footer, and children props.
- **Feature 03 — Auth**: `@clerk/ui` installed; `ClerkProvider` wraps root layout with `dark` theme from `@clerk/ui/themes` and CSS-variable overrides; `proxy.ts` at project root uses `clerkMiddleware` + `createRouteMatcher` to protect all routes except sign-in and sign-up; sign-in and sign-up pages use Clerk prebuilt components inside a 2-panel layout (logo/tagline left, form right on large screens; stacked on small screens); root `page.tsx` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`; `UserButton` added to `EditorNavbar` right section.
- **Feature 04 — Project Dialogs**: Editor home screen with heading, description, and Create/Open buttons; `useProjectDialogs` hook in `hooks/` managing dialog, form, and loading state; Create, Rename, and Delete project dialogs in `components/editor/project-dialogs.tsx`; `ProjectDialogsContext` threads `openCreateDialog` and `openSidebar` from `EditorShell` to the editor page; `ProjectSidebar` updated with mock project list, Rename/Delete actions for owned projects (hidden for shared), mobile backdrop scrim; `lib/mock-projects.ts` holds `Project` type, mock data, and `toSlug` utility.
- **Feature 05 — Prisma**: `prisma/schema.prisma` with `Project` (ownerId, name, description, status enum DRAFT/ACTIVE/ARCHIVED, canvasJsonPath, timestamps, indexes on ownerId and ownerId+createdAt) and `ProjectCollaborator` (project FK with cascade delete, collaboratorEmail, createdAt, unique on projectId+email, indexes on email and createdAt) models; `lib/prisma.ts` singleton branching by `DATABASE_URL` (Accelerate via `accelerateUrl`+`withAccelerate()` for `prisma+postgres://` URLs, direct `PrismaPg` adapter otherwise), cached on `globalThis` in development; migration `20260504154525_init` applied and tables verified in database.

## In Progress

- None.

## Next Up

- Feature 06 (TBD per feature-specs).

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
