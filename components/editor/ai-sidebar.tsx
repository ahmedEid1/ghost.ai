"use client";

import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AiSidebarHeader } from "@/components/editor/ai-sidebar-header";
import { AiArchitectTab } from "@/components/editor/ai-architect-tab";
import { SpecsTab } from "@/components/editor/specs-tab";
import type { AiActivityState } from "@/hooks/use-ai-activity-state";
import type { CanvasSnapshot } from "@/components/editor/canvas";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  aiActivity: AiActivityState;
  getCanvasSnapshot: () => CanvasSnapshot;
}

export function AiSidebar({ isOpen, onClose, projectId, aiActivity, getCanvasSnapshot }: AiSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="ml-2 flex w-[21rem] shrink-0 flex-col overflow-hidden rounded-3xl border border-border-default bg-surface shadow-[var(--shadow-panel)]">
      <AiSidebarHeader onClose={onClose} />

      <Tabs
        defaultValue="architect"
        className="flex min-h-0 flex-1 flex-col overflow-hidden gap-0"
      >
        <div className="flex items-center border-b border-border-default bg-elevated/60 px-3 py-2">
          <TabsList
            variant="line"
            className="h-auto flex-1 justify-start rounded-none border-none p-0"
          >
            <TabsTrigger
              value="architect"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-text-muted after:hidden data-active:bg-accent-ai-dim data-active:text-accent-ai-text"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-text-muted after:hidden data-active:bg-accent-ai-dim data-active:text-accent-ai-text"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* Compact activity indicator — only visible during an active run */}
          {aiActivity.isActive && (
            <div
              className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1"
              style={{ background: "var(--accent-ai-dim)" }}
              aria-label="Ghost AI is working"
            >
              <Loader2
                className="h-3 w-3 animate-spin"
                style={{ color: "var(--accent-ai-text)" }}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: "var(--accent-ai-text)" }}
              >
                Working
              </span>
            </div>
          )}
        </div>

        <TabsContent
          value="architect"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <AiArchitectTab projectId={projectId} aiActivity={aiActivity} />
        </TabsContent>

        <TabsContent
          value="specs"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <SpecsTab projectId={projectId} getCanvasSnapshot={getCanvasSnapshot} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
