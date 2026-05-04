"use client";

import { useState } from "react";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { WorkspaceSidebar } from "@/components/editor/workspace-sidebar";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Canvas } from "@/components/editor/canvas";
import { type ProjectStatus } from "@/lib/types";

interface WorkspaceProject {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  isOwner: boolean;
}

interface WorkspaceShellProps {
  project: WorkspaceProject;
}

export function WorkspaceShell({ project }: WorkspaceShellProps) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <WorkspaceNavbar
        projectName={project.name}
        projectStatus={project.status}
        isAiSidebarOpen={isAiSidebarOpen}
        onAiSidebarToggle={() => setIsAiSidebarOpen((prev) => !prev)}
        onShareOpen={() => setIsShareDialogOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar />

        <main className="relative flex flex-1 overflow-hidden">
          <Canvas roomId={project.id} />
        </main>

        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
        />
      </div>

      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        projectId={project.id}
        projectName={project.name}
        isOwner={project.isOwner}
      />
    </div>
  );
}
