"use client";

import { useState } from "react";
import { LayoutGrid, ImageIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type WorkspaceSection = "canvas" | "assets" | "settings";

const NAV_ITEMS: {
  id: WorkspaceSection;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "canvas", icon: LayoutGrid, label: "Canvas" },
  { id: "assets", icon: ImageIcon, label: "Assets" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function WorkspaceSidebar() {
  const [active, setActive] = useState<WorkspaceSection>("canvas");

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border-default bg-surface py-2">
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant="ghost"
          size="icon"
          onClick={() => setActive(id)}
          aria-label={label}
          title={label}
          className={`h-9 w-9 rounded-xl transition-colors ${
            active === id
              ? "bg-accent-primary-dim text-accent-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
          style={
            active === id
              ? {
                  color: "var(--accent-primary)",
                  background: "var(--accent-primary-dim)",
                }
              : undefined
          }
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </aside>
  );
}
