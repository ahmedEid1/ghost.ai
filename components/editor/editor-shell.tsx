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
import { ShareDialog } from "@/components/editor/share-dialog";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { type Project } from "@/lib/types";

interface EditorShellProps {
  children: React.ReactNode;
  initialProjects: Project[];
}

export function EditorShell({ children, initialProjects }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Project | null>(null);

  const {
    projects,
    activeDialog,
    targetProject,
    projectName,
    isSubmitting,
    error,
    slug,
    setProjectName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectDialogs(initialProjects);

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
          onShareProject={(project) => {
            setIsSidebarOpen(false);
            setShareTarget(project);
          }}
        />
        <main className="h-full pt-12">{children}</main>

        <CreateProjectDialog
          open={activeDialog === "create"}
          projectName={projectName}
          slug={slug}
          isSubmitting={isSubmitting}
          error={activeDialog === "create" ? error : null}
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
          error={activeDialog === "rename" ? error : null}
          onProjectNameChange={setProjectName}
          onRename={handleRename}
          onClose={closeDialog}
        />
        <DeleteProjectDialog
          open={activeDialog === "delete"}
          project={targetProject}
          isSubmitting={isSubmitting}
          error={activeDialog === "delete" ? error : null}
          onDelete={handleDelete}
          onClose={closeDialog}
        />

        {shareTarget && (
          <ShareDialog
            open={shareTarget !== null}
            onOpenChange={(open) => {
              if (!open) setShareTarget(null);
            }}
            projectId={shareTarget.id}
            projectName={shareTarget.name}
            isOwner={shareTarget.isOwner}
          />
        )}
      </div>
    </ProjectDialogsContext.Provider>
  );
}
