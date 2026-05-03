"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogsContext } from "@/components/editor/project-dialogs-context";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

interface EditorShellProps {
  children: React.ReactNode;
}

export function EditorShell({ children }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    projects,
    activeDialog,
    targetProject,
    projectName,
    isSubmitting,
    slug,
    setProjectName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectDialogs();

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  return (
    <ProjectDialogsContext.Provider value={{ openCreateDialog, openSidebar }}>
      <div className="h-screen w-screen overflow-hidden bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projects}
          onOpenCreateDialog={openCreateDialog}
          onRenameProject={openRenameDialog}
          onDeleteProject={openDeleteDialog}
        />
        <main className="h-full pt-12">{children}</main>

        <CreateProjectDialog
          open={activeDialog === "create"}
          projectName={projectName}
          slug={slug}
          isSubmitting={isSubmitting}
          onProjectNameChange={setProjectName}
          onCreate={handleCreate}
          onClose={closeDialog}
        />
        <RenameProjectDialog
          open={activeDialog === "rename"}
          project={targetProject}
          projectName={projectName}
          slug={slug}
          isSubmitting={isSubmitting}
          onProjectNameChange={setProjectName}
          onRename={handleRename}
          onClose={closeDialog}
        />
        <DeleteProjectDialog
          open={activeDialog === "delete"}
          project={targetProject}
          isSubmitting={isSubmitting}
          onDelete={handleDelete}
          onClose={closeDialog}
        />
      </div>
    </ProjectDialogsContext.Provider>
  );
}
