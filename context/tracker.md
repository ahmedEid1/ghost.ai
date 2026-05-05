# Workflow & Tracker

## Approach

**Spec-first, incremental delivery.** The single context file (`ghost-ai.md`) defines product, architecture, and design. Features ship one subsystem at a time, verified against invariants, and progress is recorded here.

## Scoping

- One feature unit or subsystem per change.
- Split work that mixes UI, API, database, realtime state, storage, or background jobs unless the pieces are tightly coupled and quickly verifiable.
- Resolve ambiguous requirements by editing the context file *before* implementation.

## Verification checklist

Before closing a feature:

1. The change works inside its defined scope.
2. Auth, storage, realtime, and AI invariants still hold.
3. The context file reflects any scope or standards change.
4. This tracker reflects actual state.

## Protected components

Do not modify shadcn/ui primitives in `components/ui/*` unless the task explicitly requires it. Apply product-specific styling at the app level.

---

## Current phase

Recruiter-positioning pass. Consolidating context, sharpening the showcase surface, and making the demo legible end to end.

## Completed

- **F1 — Auth & projects.** Clerk auth, route protection via `proxy.ts`, project CRUD, owner/collaborator access, share dialog, Prisma models.
- **F2 — Collaborative canvas.** Liveblocks room, React Flow sync, presence cursors, undo/redo, deletion, autosave, restore, custom shapes, edges, routing, keyboard shortcuts.
- **F3 — Presence & chat.** Avatar cluster, room chat, Ghost AI presence.
- **F4 — Starter templates.** Pre-built canvas seeds.
- **F5 — AI architecture generation.** Trigger.dev task, Claude planning, Zod-validated mutations, room-wide status events, realtime subscription.
- **F6 — Spec generation.** Trigger.dev task, Claude Markdown output, Vercel Blob persistence, sidebar list, preview dialog, secure download.
- **F7 — Portfolio UI modernization.** Studio palette tokens, recruiter-ready auth panel, polished dashboard, deep canvas, modern sidebars, refreshed controls and node palette.
- **F8 — Design system showcase.** Public `/ui-showcase` route with colors, animations, components sections.
- **Local infra.** Docker Compose with app, Trigger.dev worker, PostgreSQL, Dockerfile, environment template.
- **Context consolidation (2026-05-05).** Merged the three context docs into `ghost-ai.md` + `tracker.md`. Recruiter-first positioning rewritten.
- **UI adherence pass (2026-05-05).** Reworked editor/workspace navbars, removed decorative public-surface drift, cleaned route links, tightened auth/project/workspace controls, and aligned touched components with token/motion rules.

## In progress

- **F9 — Showcase elevation.** Best-in-class redesign of `/ui-showcase` with refined hero, live AI/collaboration vignettes, motion-rich previews, and recruiter narrative.

## Next up

- Audit `/ui-showcase` at desktop and laptop widths after F9 lands.
- Consider a public landing page (`/`) that links to the showcase and the editor.
- Optional: case study route (`/how-it-works`) walking through the Trigger.dev → Claude → Liveblocks flow.

## Open questions

- Should the showcase expose a "copy token name" affordance for developers reading the page?

## Public entry

- `/` now serves a public landing page for unauthenticated visitors and fast-paths signed-in users to `/editor`.
- `/ui-showcase` is a public, unauthenticated design-system surface.

## Architecture decisions

- Tailwind v4 uses CSS-variable theming via `@theme inline` in `globals.css`.
- shadcn/ui primitives in `components/ui/` are protected foundation.
- Next.js 16 route protection lives in `proxy.ts` (not `middleware.ts`).
- AI provider is Claude via `@ai-sdk/anthropic`.
- The visual direction is a studio palette (light shell, deep canvas) — not a dark theme.

## Verification notes

- `npm.cmd run build` passes.
- Targeted ESLint passes for the public entry, showcase, auth, project dashboard, navbars, dialogs, chat, AI/spec tabs, template modal, and touched UI helper.
- Full-project ESLint still includes generated Trigger build output and broader pre-existing rules in untouched files, including autosave/liveblocks typing cleanup.
- Local dev server runs at `http://127.0.0.1:3000`; first requests can be slow while Turbopack compiles `proxy.ts`.
