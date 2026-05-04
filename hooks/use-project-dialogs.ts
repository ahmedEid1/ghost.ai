"use client";

import { useState } from "react";
import { type Project } from "@/lib/types";
import { toSlug } from "@/lib/utils";
import { useProjectActions } from "@/hooks/use-project-actions";

export type DialogType = "create" | "rename" | "delete" | null;

export function useProjectDialogs(initialProjects: Project[]) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { createProject, updateProject, deleteProject, isCreating, isUpdating, isDeleting } =
    useProjectActions();

  function openCreateDialog() {
    setProjectName("");
    setTargetProject(null);
    setError(null);
    setActiveDialog("create");
  }

  function openRenameDialog(project: Project) {
    setProjectName(project.name);
    setTargetProject(project);
    setError(null);
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: Project) {
    setTargetProject(project);
    setProjectName("");
    setError(null);
    setActiveDialog("delete");
  }

  function closeDialog() {
    setActiveDialog(null);
    setTargetProject(null);
    setProjectName("");
    setError(null);
  }

  async function handleCreate() {
    const slug = toSlug(projectName);
    if (!projectName.trim() || !slug) return;
    setError(null);
    try {
      const created = await createProject({ name: projectName.trim() });
      setProjects((prev) => [created, ...prev]);
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  async function handleRename() {
    if (
      !projectName.trim() ||
      !toSlug(projectName) ||
      !targetProject ||
      projectName.trim() === targetProject.name
    )
      return;
    setError(null);
    try {
      const updated = await updateProject(targetProject.id, {
        name: projectName.trim(),
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === targetProject.id ? updated : p))
      );
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename project");
    }
  }

  async function handleDelete() {
    if (!targetProject) return;
    setError(null);
    try {
      await deleteProject(targetProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== targetProject.id));
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  return {
    projects,
    activeDialog,
    targetProject,
    projectName,
    isSubmitting: isCreating || isUpdating || isDeleting,
    error,
    slug: toSlug(projectName),
    setProjectName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  };
}
