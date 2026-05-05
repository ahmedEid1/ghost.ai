# Ghost AI

**A real-time, AI-native system design studio.** A user describes a system in plain language, Claude generates a validated architecture, the team edits it together on a live canvas, and the platform produces a structured technical spec — all backed by durable workflows, role-based access, and blob storage.

---

## Why this project exists

Ghost AI is built as a portfolio piece for a **full-stack + applied AI engineer**. Every feature is a deliberate signal of an engineering capability that is hard to fake:

| Engineering signal | Where it shows up |
|---|---|
| **Durable AI workflows** | Claude runs inside Trigger.dev tasks — never inside a request handler — with retries, checkpoints, and progress streaming |
| **Schema-validated model output** | Every Claude response is parsed against a Zod schema before it touches Liveblocks or the database |
| **Real-time CRDT collaboration** | Liveblocks room with typed presence, undo/redo, conflict-free node and edge sync via React Flow |
| **Role-based access control** | Clerk auth, owner/collaborator model, server-side access checks on every mutation, three-layer workspace guard |
| **Production storage model** | Prisma + PostgreSQL for relational state, Vercel Blob for canvas snapshots and generated specs, autosave with optimistic UI |
| **Token-driven design system** | All color, motion, and shape come from CSS custom properties surfaced through Tailwind — no hardcoded values in components |
| **Modern Next.js boundary discipline** | Server Components by default, `"use client"` only for browser interactivity, route protection in `proxy.ts` |

---

## 60-second demo path

1. **Sign in** via Clerk → land on the editor.
2. **Create a project** → enter a real-time Liveblocks room with presence and cursors.
3. **Open the AI Architect** → describe a system (e.g. *"a multi-tenant analytics pipeline with event ingestion, queue, warehouse, and dashboard"*).
4. Claude streams a validated plan into the room → nodes and edges appear live for every collaborator.
5. Edit, rearrange, add custom shapes → autosave persists to Vercel Blob.
6. **Generate Spec** → Claude produces structured Markdown → stored to Blob → previewable and downloadable from the sidebar.

The whole loop is < 60 seconds and exercises every engineering signal in the table above.

---

## Tech stack

| Layer | Tech |
|---|---|
| App framework | Next.js 16 + TypeScript (strict) |
| Auth | Clerk |
| Real-time | Liveblocks + React Flow |
| Background jobs | Trigger.dev (v4) |
| AI | Claude via `@ai-sdk/anthropic` |
| Database | Prisma + PostgreSQL |
| Object storage | Vercel Blob (canvas snapshots, generated specs) |
| UI | Tailwind v4 (CSS-variable theming) + shadcn/ui + Lucide |

---

## Module organization

- `app/api/*` — thin handlers: validate → auth check → trigger job → persist → respond
- `trigger/*` — durable background work only, never request handlers
- `lib/*` — shared infra (Prisma client, access helpers, AI schemas, utilities)
- `hooks/*` — client-only interactivity and state
- `components/*` — UI composition; business logic stays in routes or `lib`
- `components/ui/*` — protected shadcn/ui primitives, styled at app level only

---

## Invariants

These hold across every change. Break one and the demo breaks.

1. **Long-running AI work never runs inside request handlers** — it runs in Trigger.dev tasks.
2. **AI output is validated before it mutates state** — define a Zod schema, parse before storage or room writes.
3. **Canvas schema stays compatible** across manual edits, templates, AI generation, autosave, and spec generation.
4. **Server Components by default** — `"use client"` is reserved for browser interactivity.
5. **Auth + access checks before every mutation** — no exceptions.
6. **Context docs change before implementation** when scope, architecture, or standards shift.

---

## Coding standards

**TypeScript**
- Strict mode, no `any`. Narrow interfaces for object contracts.
- Validate unknown input at API, AI, storage, and realtime boundaries.

**Next.js 16**
- Read `node_modules/next/dist/docs/` before modifying Next-specific APIs (training data is stale).
- Route protection via `proxy.ts` with Clerk middleware, not `middleware.ts`.

**Styling**
- Use CSS custom properties from `globals.css` through Tailwind utilities.
- No raw Tailwind color families (`zinc-*`, `gray-*`) in product components.
- Keep UI dense, legible, product-focused. No decorative gradients, blobs, or marketing-style hero blocks.

**APIs & data**
- Handlers stay thin — validate, authorize, trigger, respond.
- Schema-validate AI outputs before any downstream use.

---

## Design system

The visual direction is a **studio palette** — light app shell with a deep, focused canvas surface. The contrast is deliberate: navigation and tooling stay readable in screen shares and recordings, while the canvas asserts itself as the work surface (the same approach Figma, Linear, and Vercel use for editor experiences). It is not "dark mode." It is a working environment.

### Palette (CSS custom properties in `globals.css`)

- **Surfaces** — `--bg-base` (app shell, near-white), `--bg-surface` (panels), `--bg-elevated` (secondary), `--bg-canvas` (deep graphite work surface)
- **Text** — `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faint`, `--text-inverse`
- **Accents** — `--accent-primary` (confident blue, primary actions), `--accent-ai` (violet, Ghost AI generation), `--accent-collab` (teal, presence and shared actions)
- **Semantic** — `--state-success`, `--state-warning`, `--state-error`, `--state-info` (each with `-dim` variant for backgrounds)
- **Canvas-specific** — `--canvas-edge-default`, `--canvas-edge-hover`, `--canvas-grid-default`

### Motion library

Motion clarifies state and guides attention. It never decorates.

| Class / animation | Duration | Use |
|---|---|---|
| `transition-smooth` | 150ms | Control feedback (buttons, hovers, toggles) |
| `transition-smooth-lg` | 300ms | Spatial movement (panels, sidebars) |
| `animate-fade-in` | 300ms | Dialogs, content load |
| `animate-slide-in-{top/bottom/left/right}` | 300ms | Notifications, sidebars, dropdowns |
| `animate-scale-in` | 250ms | Popovers, tooltips |
| `animate-pulse-ring` | 2s loop | Active indicators, focus rings |
| `ghost-flow-dashed` | 1.6s loop | AI-generated edges in flight |
| `ghost-pulse-dot` | 1.6s loop | AI / save / presence dot states |

All animations respect `prefers-reduced-motion: reduce`.

### Typography

- **UI** — Geist Sans (controls, navigation, body)
- **Code & technical** — Geist Mono (node labels, spec previews, token names)
- Compact density inside tools and sidebars; breathing room on the canvas itself.

### Shape

- `rounded-xl` (frequent controls), `rounded-2xl` (cards and panels), `rounded-3xl` (modals and full-screen overlays).

### Node palette

Eight canonical color pairs tuned for contrast on the deep canvas, defined in `types/canvas.ts`: Graphite, Blue, Violet, Amber, Rose, Fuchsia, Green, Teal.

---

## Recruiting first

Every interaction should answer: *"Can this person build modern, collaborative, AI-aware systems end to end?"*

- Demo loop runs in under 60 seconds: describe → diagram → collaborate → spec.
- Code boundaries are immediately legible in the file tree.
- No fake data, no marketing UI, no decorative chrome.
- The `/ui-showcase` route is a public, no-auth surface that demonstrates design-token discipline and motion vocabulary to anyone reviewing the project.
