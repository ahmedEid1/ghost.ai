"use client";

import Link from "next/link";
import { ChevronRight, Home, Share2, BrainCircuit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ProjectStatus } from "@/lib/types";

interface WorkspaceNavbarProps {
  projectName: string;
  projectStatus: ProjectStatus;
  isAiSidebarOpen: boolean;
  onAiSidebarToggle: () => void;
  onShareOpen: () => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  DRAFT: "text-text-muted",
  ACTIVE: "text-state-success",
  ARCHIVED: "text-text-faint",
};

export function WorkspaceNavbar({
  projectName,
  projectStatus,
  isAiSidebarOpen,
  onAiSidebarToggle,
  onShareOpen,
}: WorkspaceNavbarProps) {
  return (
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-border-default bg-surface px-3">
      {/* Left: breadcrumb */}
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          href="/editor"
          className="flex items-center gap-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <Home className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Projects</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-faint" />
        <span className="truncate font-medium text-text-primary">{projectName}</span>
        <span
          className={`hidden shrink-0 text-xs sm:inline ${STATUS_COLORS[projectStatus]}`}
        >
          · {STATUS_LABELS[projectStatus]}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          onClick={onShareOpen}
          aria-label="Share project"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant={isAiSidebarOpen ? "secondary" : "ghost"}
          size="icon"
          className={`h-7 w-7 transition-colors ${
            isAiSidebarOpen
              ? "text-accent-ai-text bg-accent-primary-dim"
              : "text-text-muted hover:text-text-primary"
          }`}
          onClick={onAiSidebarToggle}
          aria-label="Toggle AI assistant"
          style={
            isAiSidebarOpen
              ? { color: "var(--accent-ai-text)", background: "var(--accent-primary-dim)" }
              : undefined
          }
        >
          <BrainCircuit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          disabled
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
