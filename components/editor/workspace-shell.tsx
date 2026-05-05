"use client";

import { useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { ChatPanel } from "@/components/editor/chat-panel";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Canvas, CanvasLoading, CanvasError, type CanvasSnapshot } from "@/components/editor/canvas";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { type CanvasTemplate } from "@/components/editor/starter-templates";
import { type ProjectStatus } from "@/lib/types";
import type { AiStatusEvent } from "@/liveblocks.config";
import { parseAiStatusEvent } from "@/types/ai-status";
import { useAiActivityState } from "@/hooks/use-ai-activity-state";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context";

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
  const { user, isLoaded } = useUser();
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(project.status);

  const { state: aiActivity, handleStatusEvent } = useAiActivityState(project.id);
  const { updateProject } = useProjectActions();
  const { syncProject } = useProjectDialogsContext();

  const handleAiStatusEvent = useCallback(
    (event: AiStatusEvent) => {
      const validated = parseAiStatusEvent(event);
      if (validated) handleStatusEvent(validated);
    },
    [handleStatusEvent],
  );

  const handleStatusChange = useCallback(
    async (status: ProjectStatus) => {
      const previousStatus = projectStatus;
      setProjectStatus(status);
      try {
        const updated = await updateProject(project.id, { status });
        syncProject(updated);
      } catch {
        setProjectStatus(previousStatus);
      }
    },
    [project.id, projectStatus, syncProject, updateProject],
  );

  const handleAiToggle = useCallback(() => {
    setIsAiSidebarOpen((prev) => {
      if (!prev) setIsChatOpen(false);
      return !prev;
    });
  }, []);

  const handleChatToggle = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) setIsAiSidebarOpen(false);
      return !prev;
    });
  }, []);

  const importTemplateRef = useRef<((template: CanvasTemplate) => void) | null>(null);
  const canvasSnapshotRef = useRef<(() => CanvasSnapshot) | null>(null);

  const handleCanvasReady = useCallback((fn: () => CanvasSnapshot) => {
    canvasSnapshotRef.current = fn;
  }, []);

  const getCanvasSnapshot = useCallback(
    (): CanvasSnapshot => canvasSnapshotRef.current?.() ?? { nodes: [], edges: [] },
    [],
  );

  const handleImportReady = useCallback(
    (fn: (template: CanvasTemplate) => void) => {
      importTemplateRef.current = fn;
    },
    [],
  );

  const handleImportTemplate = useCallback((template: CanvasTemplate) => {
    importTemplateRef.current?.(template);
  }, []);

  const authEndpoint = useCallback(
    async (room: string | undefined) => {
      if (!user) return { error: "forbidden", reason: "Not authenticated" };

      const displayName =
        user.fullName ??
        user.emailAddresses[0]?.emailAddress ??
        "Anonymous";

      const response = await fetch("/api/liveblocks-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          roomId: room ?? project.id,
          displayName,
          avatarUrl: user.imageUrl ?? "",
        }),
      });

      if (response.status === 403) {
        return { error: "forbidden", reason: "Access denied" };
      }

      return response.json();
    },
    [user, project.id],
  );

  if (!isLoaded) return <CanvasLoading />;
  if (!user) return <CanvasError />;

  return (
    <LiveblocksProvider authEndpoint={authEndpoint}>
      <RoomProvider
        id={project.id}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <ClientSideSuspense fallback={<CanvasLoading />}>
          <div className="flex h-full flex-col bg-base">
            <WorkspaceNavbar
              projectName={project.name}
              projectStatus={projectStatus}
              isOwner={project.isOwner}
              isAiSidebarOpen={isAiSidebarOpen}
              isAiActive={aiActivity.isActive}
              isChatOpen={isChatOpen}
              onAiSidebarToggle={handleAiToggle}
              onChatToggle={handleChatToggle}
              onShareOpen={() => setIsShareDialogOpen(true)}
              onStarterTemplatesOpen={() => setIsTemplatesOpen(true)}
              onStatusChange={handleStatusChange}
            />

            <div className="flex flex-1 overflow-hidden p-2 pt-0">
              <main className="relative flex flex-1 overflow-hidden rounded-3xl border border-border-default bg-canvas shadow-[var(--shadow-soft)]">
                <Canvas
                  roomId={project.id}
                  currentUserId={user.id}
                  onImportReady={handleImportReady}
                  onAiStatusEvent={handleAiStatusEvent}
                  onCanvasReady={handleCanvasReady}
                />
              </main>

              <AiSidebar
                isOpen={isAiSidebarOpen}
                onClose={() => setIsAiSidebarOpen(false)}
                projectId={project.id}
                aiActivity={aiActivity}
                getCanvasSnapshot={getCanvasSnapshot}
              />

              <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                projectId={project.id}
              />
            </div>

            <ShareDialog
              open={isShareDialogOpen}
              onOpenChange={setIsShareDialogOpen}
              projectId={project.id}
              projectName={project.name}
              isOwner={project.isOwner}
            />

            <StarterTemplatesModal
              open={isTemplatesOpen}
              onOpenChange={setIsTemplatesOpen}
              onImport={handleImportTemplate}
            />
          </div>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
