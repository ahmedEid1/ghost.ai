"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AiSidebarHeader } from "@/components/editor/ai-sidebar-header";
import { AiArchitectTab } from "@/components/editor/ai-architect-tab";
import { SpecsTab } from "@/components/editor/specs-tab";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border-default bg-surface">
      <AiSidebarHeader onClose={onClose} />

      <Tabs
        defaultValue="architect"
        className="flex min-h-0 flex-1 flex-col overflow-hidden gap-0"
      >
        <TabsList
          variant="line"
          className="h-auto w-full justify-start rounded-none border-b border-border-default px-3 py-2"
        >
          <TabsTrigger
            value="architect"
            className="rounded-xl px-3 py-1.5 text-xs font-medium text-text-muted after:hidden data-active:bg-accent-primary-dim data-active:text-accent-ai-text"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-xl px-3 py-1.5 text-xs font-medium text-text-muted after:hidden data-active:bg-accent-primary-dim data-active:text-accent-ai-text"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="architect"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <AiArchitectTab />
        </TabsContent>

        <TabsContent
          value="specs"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
