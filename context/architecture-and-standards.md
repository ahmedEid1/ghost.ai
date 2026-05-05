# Architecture & Standards

## Stack

| Layer | Tech | Responsibility |
|---|---|---|
| App | Next.js 16 + TypeScript | Routes, UI composition, server components |
| Auth | Clerk | Identity, route protection, sessions |
| Realtime | Liveblocks + React Flow | Shared canvas, presence, room chat |
| Jobs | Trigger.dev + Claude | Durable AI workflows and background tasks |
| Data | Prisma + PostgreSQL | Projects, collaborators, specs, task runs |
| Artifacts | Vercel Blob | Canvas snapshots and generated Markdown |
| UI | Tailwind + shadcn/ui + Lucide | Tokenized components |

## Module Boundaries

- **`app/api`**: Request handlers, validation, auth checks, task triggering, persistence.
- **`trigger`**: Long-running AI work and durable background workflows.
- **`lib`**: Shared infrastructure: Prisma, access helpers, AI schemas, utilities.
- **`hooks`**: Client behavior and state orchestration only.
- **`components`**: UI composition; business logic belongs in routes or shared modules.
- **`components/ui`**: Generated shadcn primitives — treat as protected.

## Storage Model

- **PostgreSQL**: Projects, collaborators, specs, task run metadata, ownership, relationships.
- **Vercel Blob**: Large artifacts (`canvas/{projectId}.json`, `specs/{projectId}/{specId}.md`).
- **Prisma**: Stores references to blobs, not the large content itself.

## Key Invariants

1. Long-running AI work never runs inside request handlers.
2. AI output is structured and validated before it mutates shared state.
3. Canvas schema stays compatible across manual edits, templates, AI changes, autosave, and spec generation.
4. Client components are used only for browser interactivity, hooks, or real-time state.
5. Context docs must change before implementation when scope, architecture, or standards change.

## Coding Rules

**TypeScript**
- Strict mode required. Avoid `any`; define narrow interfaces for object contracts.
- Validate unknown input at API, AI, storage, and realtime boundaries.

**Next.js 16**
- Default to React Server Components. Add `"use client"` only for browser interactivity or hooks.
- Route protection uses `proxy.ts` with Clerk middleware, not `middleware.ts`.
- Read `node_modules/next/dist/docs/` before changing Next.js-specific APIs.

**Styling**
- Use CSS custom property tokens from `globals.css` through Tailwind utilities only.
- No raw Tailwind color families (`zinc-*`, `gray-*`) in product components.
- Keep UI dense, legible, and product-first.

**APIs & Data**
- Auth and access checks happen before every mutation.
- Route handlers stay thin: validate, authorize, trigger jobs, return shapes.
- AI outputs must be schema-validated before use.

**File Ownership**
- `app/api`: request boundaries
- `trigger`: durable background work
- `lib`: shared infrastructure and domain helpers
- `hooks`: client behavior
- `components`: UI composition
