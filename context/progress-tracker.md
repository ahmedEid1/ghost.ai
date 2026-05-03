# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Feature 02 — Editor Chrome: navbar, project sidebar, reusable dialog pattern.

## Completed

- **Feature 01 — Design System**: shadcn/ui installed and configured; Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added to `components/ui/`; dark theme CSS custom properties set in `globals.css`; `lib/utils.ts` with `cn()` created; `lucide-react` installed.
- **Feature 02 — Editor Chrome**: `EditorNavbar` with sidebar toggle (PanelLeftOpen/Close icons); `ProjectSidebar` floating overlay with Tabs (My Projects / Shared with Me), empty states, Create New Project button; `EditorDialog` reusable wrapper around shadcn Dialog accepting title, description, footer, and children props.

## In Progress

- None.

## Next Up

- Feature 03 (TBD per feature-specs).

## Open Questions

- None.

## Architecture Decisions

- Using Tailwind v4 with CSS-variable-based theming via `@theme inline` in `globals.css`.
- shadcn/ui components live in `components/ui/` and must not be modified after generation.
- Dark-only: all color tokens are on `:root`, no `.dark` class toggle needed.

## Session Notes

- All color tokens defined as CSS custom properties in `globals.css` and mapped via `@theme inline`. Components must use token-based utility classes, not raw Tailwind color classes or hardcoded hex values.
- shadcn semantic tokens (`--background`, `--foreground`, etc.) are wired directly to the dark theme hex values in `:root`.
