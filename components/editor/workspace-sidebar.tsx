"use client";

import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceSidebar() {
  return (
    <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border-default bg-surface py-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Canvas"
        title="Canvas"
        className="h-9 w-9 rounded-xl transition-colors"
        style={{ color: "var(--accent-primary)", background: "var(--accent-primary-dim)" }}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </aside>
  );
}
