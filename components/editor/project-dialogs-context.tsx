"use client";

import { createContext, useContext } from "react";
import { type Project } from "@/lib/types";

interface ProjectDialogsContextValue {
  openCreateDialog: () => void;
  openSidebar: () => void;
  projects: Project[];
  openEditDialog: (project: Project) => void;
  openDeleteDialog: (project: Project) => void;
  openShareDialog: (project: Project) => void;
  duplicateProject: (project: Project) => Promise<void>;
}

export const ProjectDialogsContext =
  createContext<ProjectDialogsContextValue | null>(null);

export function useProjectDialogsContext(): ProjectDialogsContextValue {
  const ctx = useContext(ProjectDialogsContext);
  if (ctx === null) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsContext.Provider"
    );
  }
  return ctx;
}
