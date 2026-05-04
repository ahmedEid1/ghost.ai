"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { WorkspaceSidebar } from "@/components/editor/workspace-sidebar";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
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

        {/* Canvas placeholder */}
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-base">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--accent-primary-dim)" }}
            >
              <Layers
                className="h-7 w-7"
                style={{ color: "var(--accent-primary)" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-primary">
                Canvas coming soon
              </p>
              <p className="text-xs text-text-muted">
                The collaborative canvas will appear here.
              </p>
            </div>
          </div>
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
