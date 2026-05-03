"use client";

import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context";

export default function EditorPage() {
  const { openCreateDialog, openSidebar } = useProjectDialogsContext();

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-semibold text-text-primary">
            Create a new project or open an existing one
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Start a new project from scratch or open an existing one to continue
            working on it.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
          <Button
            size="lg"
            onClick={openCreateDialog}
            className="gap-2 sm:min-w-44"
          >
            <Plus className="h-4 w-4" />
            Create new project
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={openSidebar}
            className="gap-2 sm:min-w-44"
          >
            <FolderOpen className="h-4 w-4" />
            Open existing project
          </Button>
        </div>
      </div>
    </div>
  );
}
