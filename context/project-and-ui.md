# Ghost AI Project Specification

## Positioning

Ghost AI is a portfolio-grade AI system design studio. A user describes a system in plain English, Ghost AI turns it into a live architecture canvas, collaborators refine it together, and the app generates a technical specification from the graph.

The product should immediately communicate full-stack and applied AI engineering depth:
- Recruiters should understand the demo in under one minute: prompt, live diagram, collaboration, generated spec.
- Developers should see clean system boundaries, real-time state, durable jobs, validation, persistence, and access control.
- AI reviewers should see a practical agent workflow: structured model output, validated mutations, progress events, and human editing.

## Core Product

- Authenticated project workspace with owner and collaborator access.
- Live React Flow canvas synced through Liveblocks.
- Canvas editing: shapes, colors, labels, edge routing, deletion, undo/redo, autosave, and restore.
- Presence: cursors, avatar cluster, Ghost AI activity state, and room chat.
- AI architecture generation through Trigger.dev background tasks and Claude.
- AI spec generation saved to Vercel Blob and tracked in Prisma.
- Starter templates for common system architectures.

## Design Direction

Ghost AI should feel like a premium engineering workspace, not a dark demo. Use an adaptive studio theme: a clean, readable app shell around a focused deep canvas surface.

| Element | Purpose |
|---------|---------|
| App background | Soft near-white neutral |
| Canvas background | Deep graphite for contrast |
| Surface | White for UI panels |
| Borders | Cool gray for definition |
| Text primary | Ink for strong hierarchy |
| Accent primary | Confident blue for product actions |
| Accent AI | Violet for Ghost AI highlights |
| Accent collab | Teal for collaboration |

**Do not hardcode colors or hex values.** Update `globals.css` tokens instead and use Tailwind utilities.

## Typography & Shape

- Use Geist Sans for UI and Geist Mono for technical labels.
- Keep type compact inside tools, sidebars, and controls.
- Use `rounded-xl` for small controls, `rounded-2xl` for cards/panels, `rounded-3xl` for modals only.
- Prefer Lucide icons for familiar actions.

## Motion

- Use motion to clarify state: AI phases, saving, sidebar open/close, selection, hover, drag, and presence.
- Transitions: 120–180ms for controls, 220–360ms for spatial movement.
- Respect `prefers-reduced-motion`.
- Avoid decorative effects that compete with the canvas.

## Canvas Palette

Node color pairs are canonical in `types/canvas.ts`: Graphite, Blue, Violet, Amber, Rose, Fuchsia, Green, and Teal. Keep these tuned for contrast on the deep graphite canvas.
