"use client";

import { useState } from "react";
import { type Project, type ProjectStatus } from "@/lib/types";

interface CreateInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

interface UpdateInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export function useProjectActions() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function createProject(input: CreateInput): Promise<Project> {
    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create project");
      return data as Project;
    } finally {
      setIsCreating(false);
    }
  }

  async function updateProject(
    projectId: string,
    input: UpdateInput
  ): Promise<Project> {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update project");
      return data as Project;
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteProject(projectId: string): Promise<void> {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete project");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    createProject,
    updateProject,
    deleteProject,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
