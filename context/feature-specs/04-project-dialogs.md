## Goal

Build the `/editor` home screen and add project dialogs/sidebars actions. No API calls or data fetching or persistence required for this task, just the UI and interactions.

## Editor Home Screen

Reuse the existing `/editor` page  layout. Don' modify the navbar or the sidebar.
In the center of the page, add:
- A heading "Create a new project or open an existing one"
- Descriptive text "Start a new project from scratch or open an existing one to continue working on it."
- A button "Create new project" that opens the "Create Project" dialog when clicked
- A button "Open existing project" that opens the "Open Project" dialog when clicked
style all of this in the best way you see fit, but keep it simple and clean and consistent with the rest of the app design and functionality.

Keep the page responsive and ensure it looks good on different screen sizes.

Clicking `Create new project` should open the `Create Project` dialog, and clicking `Open existing project` should open the `Open Project` dialog.

## Dialogs

### Create Project Dialog
- project name input field
- live slug preview that updates as the user types the project name
- a "Create" button that is disabled until the project name is not empty
- a "Cancel" button that closes the dialog without doing anything

### Rename Project Dialog
- project name input field pre-filled with the current project name
- Current project slug displayed below the input field
- live slug preview that updates as the user types the project name
- a "Rename" button that is disabled until the project name is not empty and different from the current name
- a "Cancel" button that closes the dialog without doing anything
- auto-focus the input field when the dialog opens

### Delete Project Dialog
- a warning message "Are you sure you want to delete this project? This action cannot be undone."
- a "Delete" button that confirms the deletion
- a "Cancel" button that closes the dialog without doing anything
- the "Delete" button should be styled in a way that indicates it's a destructive action (e.g., red color)
- auto-focus the "Cancel" button when the dialog opens to prevent accidental deletions


## Sidebar Actions
In the project sidebar, add the following actions for each project:
- "Rename" action that opens the "Rename Project" dialog for the selected project
- "Delete" action that opens the "Delete Project" dialog for the selected project

show actions only for owned projects, not for shared projects.

Hide the "Rename" and "Delete" actions for shared projects, as users should not be able to rename or delete projects they do not own.

On Mobile:
- tapping outside the sidebar should close it
- add a backdrop scrim
- ensure the sidebar is scrollable if the content exceeds the viewport height
- ensure the sidebar is accessible and usable on smaller screens, with appropriately sized touch targets and responsive design adjustments as needed
- ensure the "Rename" and "Delete" actions are still accessible for owned projects on mobile devices, while remaining hidden for shared projects


## Implementation

Create a dedicated hook to manage:
- dialog state
- form state
- loading state

Wire:
- editor home New Project button to open the Create Project dialog
- editor home Open Project button to open the Open Project dialog
- project sidebar Rename action to open the Rename Project dialog
- project sidebar Delete action to open the Delete Project dialog
- dialog form inputs to update form state
- dialog form buttons to handle form submission and loading state
- dialog Cancel buttons to close the dialogs and reset form state
- ensure that the "Create" button in the Create Project dialog is disabled until the project name input is not empty
- ensure that the "Rename" button in the Rename Project dialog is disabled until the project name input is not empty and different from the current project name
- ensure that the "Delete" button in the Delete Project dialog is styled as a destructive action (e.g., red color) and that it confirms the deletion when clicked
- ensure that the "Cancel" button in the Delete Project dialog is auto-focused when the dialog opens to prevent accidental deletions
- ensure that the dialogs are responsive and look good on different screen sizes
- ensure that the sidebar actions are only shown for owned projects and not for shared projects
- ensure that the sidebar is scrollable on mobile if the content exceeds the viewport height
- ensure that tapping outside the sidebar on mobile closes it and shows a backdrop scrim
- ensure that the sidebar and dialogs are accessible and usable on smaller screens, with appropriately sized touch targets and responsive design adjustments as needed
- ensure that the "Rename" and "Delete" actions are still accessible for owned projects on mobile devices, while remaining hidden for shared projects
- ensure that the input fields in the dialogs are auto-focused when the dialogs open for better user experience
- ensure that the live slug preview updates as the user types the project name in both the Create Project and Rename Project dialogs
- ensure that the current project slug is displayed below the input field in the Rename Project dialog for reference
- ensure that the dialog forms are properly reset when the dialogs are closed, so that opening the dialogs again starts with a clean state
- ensure that the dialog forms handle loading state appropriately, such as disabling buttons and showing a loading indicator when a form submission is in progress
- ensure that the overall design of the dialogs and sidebar actions is consistent with the rest of the app and follows best practices for UI/UX design, such as clear labeling, intuitive interactions, and visual hierarchy
- ensure that the implementation is done in a clean and maintainable way, following best practices for React development, such as using hooks for state management, breaking down components into smaller reusable pieces, and keeping the code organized and readable
- ensure that the implementation is done in a way that allows for easy integration with future API calls and data persistence, such as by structuring the form state and submission handlers in a way that can easily be connected to backend endpoints when needed

Use mock project data to demonstrate the functionality of the dialogs and sidebar actions, and ensure that the UI updates correctly based on user interactions. no actual API calls or data persistence are required for this task, but the implementation should be structured in a way that allows for easy integration with backend functionality in the future.

## Check when done
- Sidebar actions are wired correctly and only show for owned projects
- slug preview updates as user types in the Create and Rename dialogs
- No typescript errors or warnings
- the app builds successfully and runs without errors
- Dialogs open and close correctly based on user interactions
- Form state updates correctly based on user input
- Buttons are enabled/disabled correctly based on form state
- Loading state is handled correctly during form submission
- The UI is responsive and looks good on different screen sizes
- The "Delete" button in the Delete Project dialog is styled as a destructive action and confirms deletion when clicked
- The "Cancel" button in the Delete Project dialog is auto-focused when the dialog opens
- Tapping outside the sidebar on mobile closes it and shows a backdrop scrim
- The sidebar is scrollable on mobile if the content exceeds the viewport height
- The dialogs and sidebar actions are accessible and usable on smaller screens, with appropriately sized touch targets and responsive design adjustments as needed
- The "Rename" and "Delete" actions are still accessible for owned projects on mobile devices, while remaining hidden for shared projects
- The input fields in the dialogs are auto-focused when the dialogs open
- The current project slug is displayed below the input field in the Rename Project dialog for reference
- The overall design of the dialogs and sidebar actions is consistent with the rest of the app and follows best practices for UI/UX design
