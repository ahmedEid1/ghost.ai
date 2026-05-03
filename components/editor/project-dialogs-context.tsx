"use client";

import { createContext, useContext } from "react";

interface ProjectDialogsContextValue {
  openCreateDialog: () => void;
  openSidebar: () => void;
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
