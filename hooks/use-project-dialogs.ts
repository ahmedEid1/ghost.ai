"use client";

import { useState } from "react";
import { type Project, type ProjectStatus } from "@/lib/types";
import { toSlug } from "@/lib/utils";
import { useProjectActions } from "@/hooks/use-project-actions";

export type DialogType = "create" | "edit" | "delete" | null;

export function useProjectDialogs(initialProjects: Project[]) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("DRAFT");
  const [error, setError] = useState<string | null>(null);

  const { createProject, updateProject, deleteProject, isCreating, isUpdating, isDeleting } =
    useProjectActions();

  function resetFormState() {
    setProjectName("");
    setProjectDescription("");
    setProjectStatus("DRAFT");
    setTargetProject(null);
    setError(null);
  }

  function openCreateDialog() {
    resetFormState();
    setActiveDialog("create");
  }

  function openEditDialog(project: Project) {
    setProjectName(project.name);
    setProjectDescription(project.description ?? "");
    setProjectStatus(project.status);
    setTargetProject(project);
    setError(null);
    setActiveDialog("edit");
  }

  function openDeleteDialog(project: Project) {
    setTargetProject(project);
    setProjectName("");
    setProjectDescription("");
    setProjectStatus("DRAFT");
    setError(null);
    setActiveDialog("delete");
  }

  function closeDialog() {
    setActiveDialog(null);
    resetFormState();
  }

  async function handleCreate() {
    const slug = toSlug(projectName);
    if (!projectName.trim() || !slug) return;
    setError(null);
    try {
      const trimmedDescription = projectDescription.trim();
      const created = await createProject({
        name: projectName.trim(),
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        ...(projectStatus !== "DRAFT" ? { status: projectStatus } : {}),
      });
      setProjects((prev) => [created, ...prev]);
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  async function handleEdit() {
    if (!targetProject) return;
    const trimmedName = projectName.trim();
    const trimmedDescription = projectDescription.trim();
    if (!trimmedName || !toSlug(trimmedName)) return;

    const patch: { name?: string; description?: string; status?: ProjectStatus } = {};
    if (trimmedName !== targetProject.name) patch.name = trimmedName;
    if (trimmedDescription !== (targetProject.description ?? "")) {
      patch.description = trimmedDescription;
    }
    if (projectStatus !== targetProject.status) patch.status = projectStatus;

    if (Object.keys(patch).length === 0) return;

    setError(null);
    try {
      const updated = await updateProject(targetProject.id, patch);
      setProjects((prev) =>
        prev.map((p) => (p.id === targetProject.id ? updated : p))
      );
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
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
    projectDescription,
    projectStatus,
    isSubmitting: isCreating || isUpdating || isDeleting,
    error,
    slug: toSlug(projectName),
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
  };
}
