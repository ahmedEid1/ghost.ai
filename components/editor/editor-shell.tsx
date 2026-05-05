"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogsContext } from "@/components/editor/project-dialogs-context";
import {
  CreateProjectDialog,
  EditProjectDialog,
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
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Project | null>(null);

  const {
    projects,
    activeDialog,
    targetProject,
    projectName,
    projectDescription,
    projectStatus,
    isSubmitting,
    error,
    slug,
    setProjectName,
    setProjectDescription,
    setProjectStatus,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialog,
    handleCreate,
    handleEdit,
    handleDelete,
  } = useProjectDialogs(initialProjects);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function openShareDialog(project: Project) {
    setIsSidebarOpen(false);
    setShareTarget(project);
  }

  async function duplicateProject(project: Project) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Copy of ${project.name}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to duplicate");

      const newProjectId: string = data.id;

      // Try to copy canvas from original project
      try {
        const canvasRes = await fetch(`/api/projects/${project.id}/canvas`);
        if (canvasRes.ok) {
          const canvasData = await canvasRes.json();
          await fetch(`/api/projects/${newProjectId}/canvas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(canvasData),
          });
        }
      } catch {
        // Canvas copy is best-effort — navigate anyway
      }

      router.push(`/editor/${newProjectId}`);
    } catch (err) {
      console.error("Failed to duplicate project:", err);
    }
  }

  return (
    <ProjectDialogsContext.Provider
      value={{
        openCreateDialog,
        openSidebar,
        projects,
        openEditDialog,
        openDeleteDialog,
        openShareDialog,
        duplicateProject,
      }}
    >
      <div className="h-screen w-screen overflow-hidden bg-base text-text-primary">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projects}
          onOpenCreateDialog={openCreateDialog}
          onEditProject={openEditDialog}
          onDeleteProject={openDeleteDialog}
          onShareProject={openShareDialog}
        />
        <main className="h-full pt-12">{children}</main>

        <CreateProjectDialog
          open={activeDialog === "create"}
          projectName={projectName}
          projectDescription={projectDescription}
          projectStatus={projectStatus}
          slug={slug}
          isSubmitting={isSubmitting}
          error={activeDialog === "create" ? error : null}
          onProjectNameChange={setProjectName}
          onProjectDescriptionChange={setProjectDescription}
          onProjectStatusChange={setProjectStatus}
          onCreate={handleCreate}
          onClose={closeDialog}
        />
        <EditProjectDialog
          open={activeDialog === "edit"}
          project={targetProject}
          projectName={projectName}
          projectDescription={projectDescription}
          projectStatus={projectStatus}
          slug={slug}
          isSubmitting={isSubmitting}
          error={activeDialog === "edit" ? error : null}
          onProjectNameChange={setProjectName}
          onProjectDescriptionChange={setProjectDescription}
          onProjectStatusChange={setProjectStatus}
          onSave={handleEdit}
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
