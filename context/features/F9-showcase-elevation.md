# Feature 9 — Showcase Elevation

## What this feature delivers

A best-in-class rebuild of the public `/ui-showcase` route. The page becomes the **opening act of the portfolio**: the surface a recruiter or developer hits before they sign in, designed to communicate engineering depth and design maturity in under a minute.

It replaces the prior tab-switched reference with a single, scrollable, narrative page that walks visitors through the Ghost AI design language in the same motion vocabulary the product itself uses.

## Goals

- Make the first impression unmistakably professional — the kind of page that ends an "is this person serious?" question.
- Show, don't tell. Every claim about real-time, AI generation, and motion gets a live, animated vignette.
- Demonstrate token-driven design: every color, animation, and shape is sourced from `globals.css`, not hardcoded.
- Keep the page server-light: it is a public route, no auth, no data fetches.
- Preserve all existing tokens and animations defined in `globals.css`.

## Sections

1. **Hero**
   - Project name with the studio palette on display (light shell, deep canvas accent strip).
   - One-line value prop, one-line stack summary.
   - Two CTAs: "Open editor" → `/editor`, "View source" → repo (placeholder href, real link can be wired later).
   - Animated background grid using `--canvas-grid-default`.

2. **Live engineering vignettes**
   Three side-by-side panels, each demonstrating a real product capability:
   - **AI generation** — Ghost-flow dashed edge, pulse dot, simulated streaming text.
   - **Real-time presence** — animated avatar cluster with cursor traces.
   - **Durable workflow** — phase progress indicator with status glow.

3. **Color system**
   - Surfaces, text hierarchy, accents, semantic feedback — each as a swatch grid.
   - Each swatch shows label, role, CSS variable name, and live preview.
   - Click-to-copy variable name for developers (graceful fallback on failure).

4. **Motion library**
   - Live previews of every named animation with duration and intended use.
   - Hover-replay so the visitor can re-trigger the animation.

5. **Component patterns**
   - Button variants (primary, secondary, tertiary, destructive, AI, collaboration) with press-state feedback.
   - Feedback toasts for success, warning, error, info.
   - Panel variants (`studio-panel`, `studio-panel-strong`, `canvas-panel`).
   - AI and presence indicators.

6. **Engineering signals footer**
   - The recruiter-facing table from `ghost-ai.md` rendered as a callout strip — what each piece of the stack demonstrates.

## Visual & motion rules

- Use only existing tokens from `globals.css`. No hex literals in components.
- All animations route through existing classes (`animate-fade-in`, `ghost-flow-dashed`, etc.).
- Sticky top navigation links jump to each section.
- Section reveals use `animate-fade-in` and slide variants on scroll-into-view (lightweight `IntersectionObserver`).
- Honor `prefers-reduced-motion` — observers still fire, but motion shrinks to opacity-only fades.
- Mobile-responsive at common laptop, desktop, and tablet widths.

## Acceptance criteria

- `/ui-showcase` renders without authentication.
- Every section is visible at desktop width without horizontal scroll.
- Live vignettes (AI, presence, workflow) animate continuously and respect reduced motion.
- Click-to-copy on a color swatch puts the CSS variable name on the clipboard.
- All swatches and animations source from CSS variables — grep finds zero hex literals in `app/ui-showcase/page.tsx`.
- The page tells the same story as `ghost-ai.md` without duplicating its prose.

## Implementation

- Location: `app/ui-showcase/page.tsx` (client component for interactivity)
- Layout: `app/ui-showcase/layout.tsx` (public, no auth, sets metadata)
- Tokens: sourced from `globals.css` via Tailwind utilities
- No new dependencies; uses existing `lucide-react` icons
