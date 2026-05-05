# Feature 7 - Portfolio-Grade UI Modernization

## What This Feature Delivers

A visual and interaction pass that makes Ghost AI feel like a finished full-stack/applied-AI product in a recruiter demo and a credible engineering tool to developers.

This feature replaces the old dark-only design direction with the adaptive studio theme defined in `context/project-and-ui.md`.

## Goals

- Make the first authenticated workspace view feel polished, current, and demo-ready.
- Use a light, readable app shell with a focused deep canvas surface.
- Make Ghost AI progress, collaboration, saving, and generation states visible and trustworthy.
- Improve color, spacing, typography, motion, empty states, loading states, and screenshot quality.
- Preserve the existing architecture, storage model, AI task boundaries, Liveblocks contracts, and Clerk access model.

## UI Requirements

- Update token values in `globals.css` and Tailwind mappings instead of hardcoding colors in components.
- Keep the canvas as the center of gravity; sidebars and controls should support the work, not compete with it.
- Use refined blue for primary product actions, violet for Ghost AI, teal for collaboration, and clear state colors for success/warning/error.
- Replace overly dark surfaces with a balanced studio palette that reads well in screen shares.
- Add purposeful motion for AI phases, sidebar transitions, save status, hover feedback, drag/drop, and presence.
- Respect `prefers-reduced-motion`.
- Avoid decorative gradients, blobs, marketing hero sections, or UI text that explains basic controls.

## Product Moments To Polish

- Signed-in editor home.
- Workspace shell and navigation.
- Project sidebar and project actions.
- Canvas surface, toolbars, nodes, edges, selection, and empty state.
- AI Architect tab, status strip, prompt composer, and run states.
- Specs tab, generation state, list, preview dialog, and download actions.
- Presence cluster, Ghost AI avatar, cursors, chat feed, and save indicator.

## Acceptance Criteria

- The app no longer presents as dark-only.
- The workspace looks intentionally designed at desktop and common laptop widths.
- Main actions are visually clear without adding explanatory copy.
- AI/collaboration/status states have polished motion and accessible reduced-motion behavior.
- Existing auth, realtime, AI generation, autosave, and spec flows keep working.
- `workflow-and-tracker.md` records the implementation state after each meaningful change.
