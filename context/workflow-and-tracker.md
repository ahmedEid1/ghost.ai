# Workflow & Progress Tracker

## Development Approach

**Spec-first, incremental delivery.** Context files define product direction, architecture, and UI standards. Features are implemented one subsystem at a time, verified against invariants, and progress is tracked before moving on.

## Scoping

- Work on one feature unit or subsystem at a time.
- Split changes that mix UI, API, database, realtime state, storage, or background jobs unless tightly coupled and quickly verifiable.
- Resolve ambiguous requirements in the context file before implementation.

## Verification Checklist

Before moving on from a feature:

1. The change works within its defined scope.
2. Auth, storage, realtime, and AI invariants still hold.
3. The relevant context doc is updated if direction changed.
4. `workflow-and-tracker.md` reflects actual state.

## Protected Components

Do not modify generated shadcn/ui primitives in `components/ui/*` unless the task explicitly requires it. Apply product-specific styling in app-level components.

---

# Progress Tracker

## Current Phase

Portfolio polish and context reset.

## Current Goal

Turn the completed Ghost AI feature set into a recruiter-ready full-stack/applied-AI showcase. Next implementation target is Feature 7 (portfolio-grade UI modernization).

## Completed ✓

- **Foundation**: Clerk auth, route protection, project CRUD, owner/collaborator access, share dialog, Prisma models.
- **Collaboration**: Liveblocks room setup, React Flow sync, presence cursors, avatar cluster, room chat, undo/redo, deletion, autosave, restore.
- **Canvas tooling**: Shape panel, custom shapes, resizing, inline labels, node colors, custom edges, routing, keyboard shortcuts, starter templates.
- **AI architecture generation**: Trigger.dev task, Claude planning, structured validation, Liveblocks mutations, room-wide status events, Ghost AI presence, realtime subscription.
- **Spec generation**: Trigger.dev task, Claude Markdown output, Vercel Blob persistence, Prisma spec records, sidebar list, preview dialog, secure download.
- **Local dev infra**: Docker Compose with Next.js app, Trigger.dev worker, PostgreSQL, Dockerfile, environment template.
- **Feature 7 UI modernization**: Adaptive studio tokens, recruiter-ready auth panel, polished project dashboard, deep canvas workspace, modern sidebars, AI/spec/chat state styling, refreshed canvas controls, updated node palette, and Vercel Blob route compatibility fix.

## In Progress

- None.

## Next Up

- Review the workspace in-browser at desktop width.
- Resolve remaining React hook lint rules in existing state/effect flows if lint clean is required.

## Open Questions

- Should the unauthenticated experience include a compact demo/case-study page for recruiters, or just a sign-in landing?

## Architecture Decisions

- Tailwind v4 uses CSS-variable theming via `@theme inline` in `globals.css`.
- shadcn/ui primitives in `components/ui/` are protected foundation.
- Next.js 16 route protection uses `proxy.ts` with Clerk middleware.
- AI provider is Claude via `@ai-sdk/anthropic`.
- Active UI direction is adaptive studio mode (not dark-only).

## Verification Notes

- `npm.cmd run build` passes.
- Scoped ESLint (`npx.cmd eslint app components hooks lib types --max-warnings=0`) still reports existing React hook `set-state-in-effect` rules in AI/status/spec/autosave flows and one unused Prisma callback variable in `lib/get-projects.ts`.
- Local dev server is running at `http://127.0.0.1:3000`; first requests may be slow while Turbopack compiles proxy on this filesystem.
