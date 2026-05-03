"use client";

import { createContext, useContext } from "react";

interface ProjectDialogsContextValue {
  openCreateDialog: () => void;
  openSidebar: () => void;
}

export const ProjectDialogsContext = createContext<ProjectDialogsContextValue>({
  openCreateDialog: () => {},
  openSidebar: () => {},
});

export function useProjectDialogsContext() {
  return useContext(ProjectDialogsContext);
}
