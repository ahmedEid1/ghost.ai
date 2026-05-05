"use client";

import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiSidebarHeaderProps {
  onClose: () => void;
}

export function AiSidebarHeader({ onClose }: AiSidebarHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border-default px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary-dim">
          <Bot className="h-4 w-4 text-accent-ai-text" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-text-primary">
            AI Workspace
          </span>
          <span className="text-xs text-text-muted">Collaborate with Ghost AI</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-text-muted hover:text-text-primary"
        onClick={onClose}
        aria-label="Close AI sidebar"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
