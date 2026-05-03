"use client";

import { useState } from "react";
import { type Project, MOCK_PROJECTS, toSlug } from "@/lib/mock-projects";

export type DialogType = "create" | "rename" | "delete" | null;

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreateDialog() {
    setProjectName("");
    setTargetProject(null);
    setActiveDialog("create");
  }

  function openRenameDialog(project: Project) {
    setProjectName(project.name);
    setTargetProject(project);
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: Project) {
    setTargetProject(project);
    setProjectName("");
    setActiveDialog("delete");
  }

  function closeDialog() {
    setActiveDialog(null);
    setTargetProject(null);
    setProjectName("");
    setIsSubmitting(false);
  }

  async function handleCreate() {
    const slug = toSlug(projectName);
    if (!projectName.trim() || !slug) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      slug,
      owned: true,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setProjects((prev) => [newProject, ...prev]);
    closeDialog();
  }

  async function handleRename() {
    if (
      !projectName.trim() ||
      !toSlug(projectName) ||
      !targetProject ||
      projectName.trim() === targetProject.name
    )
      return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setProjects((prev) =>
      prev.map((p) =>
        p.id === targetProject.id
          ? { ...p, name: projectName.trim(), slug: toSlug(projectName) }
          : p
      )
    );
    closeDialog();
  }

  async function handleDelete() {
    if (!targetProject) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setProjects((prev) => prev.filter((p) => p.id !== targetProject.id));
    closeDialog();
  }

  return {
    projects,
    activeDialog,
    targetProject,
    projectName,
    isSubmitting,
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
