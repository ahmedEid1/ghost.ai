Clerk is already installed and connected. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Use the Clerk `dark` theme from `@clerk/ui/themes` as the base.

Override Clerk appearance variables using the app's existing CSS variables.  Don't hardcode any colors, but instead use the app's existing color variables to ensure a consistent look and feel.

## Sign-in and Sign-up
-  large screens: simple 2-panel layout.
- left panel: app logo, tagline, and a brief description of the app.
- right panel: Clerk's sign-in/sign-up form. the form is centered vertically and horizontally within the right panel.
- small screens: single-column layout.
- top section: app logo and tagline.
- bottom section: Clerk's sign-in/sign-up form, centered horizontally.
- The sign-in/sign-up form should be visually appealing and user-friendly, with clear calls to action and a clean design.
- no gradients, no oversized hero sections or feature colors.
- no scroll-heavy layouts. the sign-in/sign-up page should fit within the viewport without requiring scrolling.

Keep the layout minimal and professional.

## Implementation
Wrap the root layout with Clerk's `ClerkProvider` using the `dark` theme.

Create sign-in and sign-up pages using Clerk's pre-built components. Customize the appearance using the app's existing CSS variables.

use `proxy.ts` at the root of the project, not the `middleware.ts` file.

Define public routes using the existing sing-in and sign-up env variables. protect everything else by default.

update `/`:

- authenticated users: redirect to `/editor`
- unauthenticated users: redirect to `/sign-in`

Add Clerk's `UserButton` component to the editor navbar right section for profile settings and sign-out.

Keep Clerk's default user menu and profile flow intact. Don't rebuild or heavily customize the Clerk internals.

Use Existing \clerk env variables for configuration. Don't rename or create new env variables for Clerk configuration.


## Dependencies
- install `@clerk/ui` package.

## Check when done
- `proxy.ts` is implemented and exists at the root of the project.
- `middleware.ts` is not used for authentication.
- all routes except for sign-in and sign-up are protected by default.
- the public routes are defined using the existing env variables.
- auth pages uses the app's existing CSS variables for styling and are visually consistent with the rest of the app.
- `ClerkProvider` is properly set up in the root layout with the `dark` theme.
- the app builds and runs without errors.
- authenticated users are redirected to `/editor` when accessing the root route.
- unauthenticated users are redirected to `/sign-in` when accessing the root route.
- the editor navbar includes the `UserButton` component in the right section, allowing users to access their profile settings and sign out.