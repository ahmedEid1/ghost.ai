We need the base chrome components that frame every editor screen. The top navbar, the sidebar, shell on the left. these will be extended and reused in every chapter that follows.

### Editor Navbar

Create `components/editor/editor-navbar.tsx`.

Requirements:
- fixed-height top navbar
- lef, center, and right sections
- left section contains sidebar toggle button.
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section stays empty for now.
- dark background eith subtle border at the bottom.

### Project Sidebar

Create `components/editor/project-sidebar.tsx`.

Requirements:
- sidebar should float above the editor canvas
- opening it should not push page content.
- slides in from the left when opened, and slides out when closed.
- accept `isOpen` prop to control visibility.
- header with  `Projects` title and close button.
- shadcn tabs:
    - `My Projects` tab.
    - `Shared with Me` tab.
- both tabs show an empty placeholder state
- full-width `Create New Project` button at the bottom of the sidebar with `Plus` icon.

### Dialog Pattern

Use the existing color tokens in `global.css` to create a reusable dialog component.

Support the following props:
- title
- description
- footer actions

Don't build the actual dialog yet.

### Check when done

- New components compile without errors.
- no linting errors.
- dialog pattern is implemented and ready to be used in future chapters.