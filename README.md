# Ghost AI — Real-time, AI-native System Design Studio

**A portfolio piece for full-stack + applied AI engineering** — built spec-first with Claude Code. Every feature is a deliberate signal: durable AI workflows, schema-validated model output, real-time CRDT collaboration, role-based access, production storage, and a token-driven design system.

## What it does

Describe a system in plain language. Claude generates a validated architecture and streams it onto a live canvas where the team edits in real time. One click turns the diagram into a structured Markdown technical spec stored in object storage. The full loop — describe, diagram, collaborate, spec — runs in under 60 seconds.

A public design-system route at [`/ui-showcase`](app/ui-showcase) presents the visual contract behind the product: live AI/presence/workflow vignettes, the color and motion vocabulary, and the engineering signals each piece of the stack demonstrates. No auth required.

## Quick Start

### With Docker Compose

```bash
cp .env.example .env         # Create env file with your secrets
docker compose up            # Runs Next.js app, Trigger.dev worker, and PostgreSQL
```

App runs at `http://localhost:3000`.

### Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev           # Next.js dev server
npx trigger dev       # In another terminal: Trigger.dev worker
```

## Build Methodology

This project uses **spec-first development with Claude Code** as an AI partner:

- Context files define the full system model and invariants
- Features are implemented one subsystem at a time
- Scope and architecture are versioned in `context/` before implementation
- Progress is tracked in real time — no drift between plan and code

The result: a codebase that another engineer can understand and extend quickly.

## Architecture Overview

| Layer | Tech | Purpose |
|---|---|---|
| App | Next.js 16 + TypeScript | Server/client routes, UI composition |
| Auth | Clerk | Identity, sessions, route protection |
| Realtime | Liveblocks + React Flow | Shared canvas, presence, room chat |
| Jobs | Trigger.dev + Claude | Durable AI design and spec workflows |
| Data | Prisma + PostgreSQL | Metadata, projects, collaborators, specs |
| Artifacts | Vercel Blob | Canvas snapshots and generated specs |
| UI | Tailwind + shadcn/ui + Lucide | Tokenized components and icons |

## Core Features

- **Real-time collaborative canvas** — React Flow synced through Liveblocks; shape, color, label, edge routing, autosave, and restore.
- **AI architecture generation** — natural-language prompt → Claude → schema-validated canvas mutations streamed live.
- **Spec generation** — one-click Markdown technical spec, persisted to Vercel Blob with secure download.
- **Presence and chat** — cursors, avatars, Ghost AI activity state, persistent room chat.
- **Starter templates** — pre-built canvases for common system patterns.
- **Public design-system route** — `/ui-showcase` documents the studio palette, motion library, and component patterns with live, animated vignettes of the AI, presence, and workflow surfaces.

## Design system

The visual direction is a **studio palette** — light app shell with a deep, focused canvas surface, the same approach Figma, Linear, and Vercel use for editor experiences. It is not "dark mode"; it is a working environment.

- All color, motion, and shape are CSS custom properties in [`app/globals.css`](app/globals.css), surfaced through Tailwind v4 with `@theme inline`.
- No hex literals in components. No raw Tailwind color families (`zinc-*`, `gray-*`) in product code.
- Motion library covers fade-in, slide variants, scale-in, pulse-ring, and Ghost-flow animations — all honoring `prefers-reduced-motion`.
- Browse it live at [`/ui-showcase`](app/ui-showcase).

## Context files

For development context, read in order:

1. **[`context/ghost-ai.md`](context/ghost-ai.md)** — single source of truth: product, architecture, invariants, coding standards, design system.
2. **[`context/tracker.md`](context/tracker.md)** — workflow, current phase, completed work, next steps.
3. **[`context/features/`](context/features)** — per-feature briefs (F1–F9). Reference when touching a known feature.

Update context files when scope or architecture changes — **before implementing**.

---

## Demo

<!-- REPLACE THIS BLOCK once you have media -->
<!-- Video: replace YOUTUBE_VIDEO_ID with the ID from your YouTube URL (e.g. youtube.com/watch?v=REPLACE_THIS → use REPLACE_THIS) -->
<!-- Screenshots: capture the four moments described in the shot guide below, then insert them as ![caption](path) image tags above each feature section -->

[![Ghost AI Demo](https://img.youtube.com/vi/YOUTUBE_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID)

<!-- END REPLACE BLOCK -->

---

<!-- ============================================================
     DEMO PRODUCTION GUIDE — DELETE THIS ENTIRE SECTION ONCE YOU
     HAVE THE VIDEO AND SCREENSHOTS. DO NOT PUBLISH THIS SECTION.
     ============================================================

## How to Record the Perfect Demo Video

**Target length:** 90–120 seconds. No voiceover needed — the UI tells the story.
**Resolution:** 1920×1080 minimum. Record at 2× if on a HiDPI screen, then export at 1080p.
**Tool:** OBS, Loom, or QuickTime. Export as MP4, upload to YouTube (unlisted is fine).
**Browser:** Chrome or Firefox, zoom at 100%, hide bookmarks bar, hide extensions.
**Before recording:** open two browser windows side by side — one signed in as you, one in incognito as a second user. Pre-type your prompt so you can paste it in one keystroke.

---

### Shot 1 — Sign-in (0:00–0:08)

Start on the sign-in page. Sign in with your account. The camera should catch:
- The Clerk sign-in UI (shows real auth, not mocked)
- The redirect landing on the project dashboard

Keep this fast — 8 seconds max. The dashboard is the product.

---

### Shot 2 — Project Dashboard and Create (0:08–0:18)

Show the project list (have 1–2 existing projects so it doesn't look empty).
Click "New Project", name it **"E-Commerce Platform"**, and hit create.
The camera should catch:
- The project list with existing projects (not an empty state)
- The create dialog
- The smooth transition into the blank canvas workspace

---

### Shot 3 — The Blank Canvas and AI Sidebar (0:18–0:25)

Pause for 3 seconds on the blank canvas with the AI tab open in the right sidebar.
This is a "before" frame — the canvas is empty, the prompt input is waiting.
Make sure the viewer can see:
- The deep graphite canvas surface
- The AI sidebar with the prompt input visible
- The workspace navbar with the project name

This screenshot is also your **hero image** for the README (capture it as `docs/screenshot-canvas-empty.png`).

---

### Shot 4 — Type and Submit the AI Prompt (0:25–0:35)

Click into the prompt field. Paste (don't type — paste so it appears instantly):

> "Design a real-time e-commerce platform: mobile app and web client, API gateway, product service, order service, payment service with Stripe, notification service, PostgreSQL for orders, Redis cache, and a message queue between services"

This prompt is deliberately rich — it will produce 8–12 nodes with multiple edge groups, which looks impressive on camera. Submit it.

---

### Shot 5 — The Phase Broadcast in Real Time (0:35–0:65) ← THIS IS THE MONEY SHOT

**This 30-second window is the single most important moment in the video.**

Keep the camera on the AI sidebar as the status messages cycle through:
- *"Ghost AI is waking up…"*
- *"Reading current canvas state…"*
- *"Planning with Claude…"*
- *"Validating 14 planned operations…"*
- *"Applying 9 node and 5 edge operations…"*
- *"Done. Added API gateway, product service, order service..."*

**Simultaneously**, nodes and edges should be appearing on the canvas behind it.
If your screen is wide enough, arrange the layout so the sidebar and the canvas are both visible at the same time. The viewer should see the status messages on the right and the diagram materialising on the left — in the same frame.

This is the moment that makes a technical interviewer pause the video. It shows:
- Agent observability (phase-by-phase status, not just a spinner)
- Structured AI output (the operations count in the message — "14 planned operations")
- Real-time broadcast (the events arrive live, not after a delay)

Capture a screenshot of this moment as `docs/screenshot-ai-generating.png` — AI sidebar showing a mid-phase status message, canvas partially populated.

---

### Shot 6 — The Completed Architecture (1:05–1:15)

Let the camera rest on the finished canvas for 5 seconds. Then:
- Zoom out slightly so all nodes are visible
- Hover over two or three nodes to show labels and interactive handles
- Click one node to show selection state (color highlight, resize handles)

Capture this as `docs/screenshot-canvas-result.png` — the fully generated architecture diagram.

---

### Shot 7 — Manual Edit (1:15–1:25)

Grab a node and drag it to a new position. Then double-click another node and change its label.
This shows the canvas is fully interactive — Ghost AI generates a starting point, humans refine it.

---

### Shot 8 — Collaborator Presence (1:25–1:40)

Switch to the incognito window (second user). Open the same project.
Cut back to the main window. The viewer should see:
- The second user's cursor moving on the canvas
- Their avatar appearing in the presence cluster in the navbar

This is best shown as a split-screen or a quick cut between windows.
Capture this as `docs/screenshot-presence.png`.

---

### Shot 9 — Generate the Spec (1:40–1:55)

Click the "Specs" tab in the right sidebar. Click "Generate Spec".
Show the spec appearing as a Markdown preview in the sidebar.
Scroll through it briefly — enough to show it's a real, detailed technical document.

End on the spec preview. Fade to black or cut.

---

### Export and Upload

1. Export as MP4, H.264, 1080p, 8–12 Mbps
2. Upload to YouTube. Title: **"Ghost AI — AI System Design Studio | Full Stack + AI Agent Demo"**
3. Description: paste the "What Is This?" section from this README
4. Thumbnail: use `docs/screenshot-canvas-result.png`
5. Copy the video ID from the URL and replace `YOUTUBE_VIDEO_ID` in the two places above
6. Delete this entire guide section from the README

============================================================ -->

---

## Features

<!-- SCREENSHOT GUIDE (delete captions once real images are in place):
     - docs/screenshot-canvas-empty.png   → blank canvas + AI sidebar open, before any prompt
     - docs/screenshot-ai-generating.png  → AI sidebar mid-phase ("Planning with Claude…"), canvas partially populated
     - docs/screenshot-canvas-result.png  → finished architecture diagram, all nodes visible, one node selected
     - docs/screenshot-presence.png       → two user cursors on canvas, avatar cluster in navbar
     Paste them below their relevant feature section using: ![alt text](docs/filename.png)
-->

### Authenticated Project Workspace
- Clerk authentication with owner and per-project collaborator access control
- Project CRUD, sharing via invite link, and role-scoped API protection

### Live Collaborative Canvas

<!-- ![Canvas with presence](docs/screenshot-presence.png) -->

- React Flow canvas synced in real time via Liveblocks — all users see the same state instantly
- Live cursors with user avatars and a Ghost AI "thinking" presence indicator
- Full editing: shapes, colors, inline labels, edge routing, keyboard shortcuts, undo/redo, multi-select deletion, autosave, and restore
- Six node shapes with semantic meaning: rectangle (services), cylinder (databases), hexagon (external), diamond (decisions), circle (clients), pill (gateways)
- Starter templates for common system architectures

### AI Architecture Generation

<!-- ![Ghost AI generating an architecture](docs/screenshot-ai-generating.png) -->
<!-- ![Completed architecture canvas](docs/screenshot-canvas-result.png) -->

- **Plain-English prompting** — describe what you want, the AI figures out the operations
- **Structured output** — Claude generates a validated action plan (add/move/resize/update/delete nodes and edges) using `generateObject` with a Zod schema; no free-form text mutations
- **Durable background execution** — design agent runs as a Trigger.dev task, not inside a request handler; retries on failure, survives network hiccups
- **Real-time phase broadcast** — `started → reading-canvas → planning → validating → applying → complete` events sent to all room members via Liveblocks
- **Pre-mutation validation** — dangling edge references, duplicate IDs, and dimension constraint violations are caught before the canvas is touched

### Technical Spec Generation
- One-click Markdown spec export from the current canvas state via Claude
- Specs stored in Vercel Blob and tracked in Postgres; previous versions accessible from the sidebar
- Secure authenticated download route with project membership verification

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js 16 App (RSC-first, "use client" only where needed)  │
│                                                              │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │  App Router │   │  API Routes  │   │  Trigger.dev     │  │
│  │  Pages/UI   │   │  Auth+Validate│  │  Background Jobs │  │
│  └─────────────┘   └──────────────┘   └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
        │                   │                    │
        ▼                   ▼                    ▼
   Liveblocks           PostgreSQL           Claude API
 (Canvas Sync +        (Projects,         (Structured Output
   Presence)          Collabs, Specs)    via generateObject)
                           │
                      Vercel Blob
                    (Canvas Snapshots,
                     Generated Specs)
```

**Architecture invariants (enforced throughout):**
1. Long-running AI work never runs inside a request handler — always Trigger.dev
2. AI output is always Zod-validated before it can mutate shared canvas state
3. Canvas schema stays compatible across manual edits, templates, AI mutations, autosave, and spec generation
4. Every API mutation verifies auth and project membership before touching data
5. Client components used only for browser interactivity, hooks, or real-time state

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| App framework | Next.js 16 + TypeScript (strict) | RSC-first, edge-ready, type safety end-to-end |
| UI | Tailwind v4 + shadcn/ui + Lucide | Tokenized design system, no raw color values in components |
| Auth | Clerk | Managed identity with per-resource access control |
| Database | PostgreSQL + Prisma v7 | Typed queries, migrations, adapter-based connection |
| Real-time | Liveblocks + React Flow | CRDT-backed canvas sync, presence, room broadcast |
| Background jobs | Trigger.dev v4 | Durable tasks, retry logic, phase metadata, realtime status |
| Artifact storage | Vercel Blob | Large generated content decoupled from the relational DB |
| AI provider | Claude (Anthropic) via AI SDK | Structured output, reliable JSON generation with Zod |

---

## AI Agent Deep Dive

The design agent in [`trigger/design-agent.ts`](trigger/design-agent.ts) is the technical heart of this project. It demonstrates a complete production-style AI agent pattern:

```
User prompt
    │
    ▼
[1] Read current canvas state from Liveblocks storage
    │
    ▼
[2] Build system prompt with full canvas context
    (existing nodes, edges, IDs, positions, layout rules)
    │
    ▼
[3] Claude generates a structured action plan
    generateObject() + Zod schema = typed JSON, never free text
    │
    ▼
[4] Pre-mutation validation pass
    Filter dangling refs, duplicate IDs, dimension constraint violations
    │
    ▼
[5] Apply validated actions to live canvas via mutateFlow()
    Writes directly into Liveblocks shared storage
    │
    ▼
[6] Broadcast phase events to all room members throughout
    Real-time status visible to every collaborator watching
```

At every step, an event is broadcast to the Liveblocks room so collaborators watching the canvas see: *"Ghost AI is reading the canvas… planning with Claude… applying 6 operations… done."* — not a spinner followed by a result.

---

## Project Structure

```
gohst.ai/
├── app/
│   ├── api/              # Thin authenticated route handlers
│   ├── editor/           # Canvas workspace (Liveblocks room, client-heavy)
│   └── (auth)/           # Clerk sign-in / sign-up pages
├── components/
│   ├── editor/           # Canvas, sidebars, presence, AI tab, spec tab
│   └── ui/               # shadcn/ui primitives (protected — do not modify)
├── trigger/
│   ├── design-agent.ts   # AI canvas generation task
│   └── generate-spec.ts  # Technical spec generation task
├── lib/                  # Prisma, Liveblocks, AI schemas, access helpers
├── hooks/                # Client-side state and project action orchestration
├── prisma/
│   └── schema.prisma     # Database schema
├── types/                # Shared TypeScript types (canvas, Liveblocks)
├── app/ui-showcase/      # Public design-system surface (no auth)
└── context/              # Spec-first development context (living docs)
    ├── ghost-ai.md       # Product, architecture, invariants, design system
    ├── tracker.md        # Workflow + current progress
    └── features/         # Per-feature briefs (F1–F9)
```

---

## Running with Docker Compose

The fastest way to run the full stack locally. One command starts the Next.js app, the Trigger.dev background worker, and a Postgres database — with migrations applied automatically.

### Prerequisites

- Docker + Docker Compose
- Accounts: [Clerk](https://clerk.com) · [Liveblocks](https://liveblocks.io) · [Trigger.dev](https://trigger.dev) · [Vercel Blob](https://vercel.com/storage/blob) · [Anthropic](https://console.anthropic.com)

### 1. Clone

```bash
git clone https://github.com/ahmedEid1/gohst.ai.git
cd gohst.ai
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your service credentials:

```env
# Database (used by the app and Trigger worker; Docker Compose sets this automatically)
DATABASE_URL=postgresql://postgres:postgres@db:5432/ghost_ai?schema=public

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Liveblocks
LIVEBLOCKS_SECRET_KEY=sk_...
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...

# Trigger.dev
TRIGGER_SECRET_KEY=tr_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 3. Start

```bash
docker compose up --build
```

This spins up three containers:

| Container | What it does | Port |
|---|---|---|
| `ghostai-db` | PostgreSQL 16 | `5432` |
| `ghostai-app` | Next.js app (runs migrations on start) | `3000` |
| `ghostai-trigger` | Trigger.dev background worker | — |

Open [http://localhost:3000](http://localhost:3000).

The app container waits for the database health check to pass before starting, then runs `prisma migrate deploy` automatically — no manual migration step needed.

---

## Running Without Docker

If you prefer a bare Node.js setup:

### Prerequisites

- Node.js 20+
- A running Postgres instance (Docker or cloud)

### Steps

```bash
npm install
cp .env.example .env   # fill in all values; set DATABASE_URL to your Postgres instance
npx prisma migrate dev
```

Then in two terminals:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:trigger
```

---

## Engineering signals

A short read of what to look for, and where it lives in the code.

| Signal | Where it shows up |
|---|---|
| **Durable AI workflows** | Claude runs inside Trigger.dev tasks ([`trigger/design-agent.ts`](trigger/design-agent.ts), [`trigger/generate-spec.ts`](trigger/generate-spec.ts)) — never inside request handlers — with retries, checkpoints, and progress streaming. |
| **Schema-validated model output** | Every Claude response is parsed against a Zod schema before it touches Liveblocks or the database. |
| **Real-time CRDT collaboration** | Liveblocks room with typed presence, undo/redo, conflict-free node and edge sync via React Flow. |
| **Role-based access control** | Clerk auth, owner/collaborator model, server-side access checks on every mutation, three-layer workspace guard. |
| **Production storage model** | Prisma + PostgreSQL for relational state, Vercel Blob for canvas snapshots and generated specs, autosave with optimistic UI. |
| **Token-driven design system** | All color, motion, and shape come from CSS custom properties surfaced through Tailwind — no hardcoded values in components. Live at [`/ui-showcase`](app/ui-showcase). |
| **Modern Next.js boundary discipline** | Server Components by default, `"use client"` only for browser interactivity, route protection in `proxy.ts` (not `middleware.ts`). |
| **Spec-first development** | Living context docs in [`context/`](context) read by both human and AI at session start; architecture invariants enforced as explicit constraints. |

---

## License

MIT
