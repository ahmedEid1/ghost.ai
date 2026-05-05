"use client";

import Link from "next/link";
import {
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutTemplate,
  MessageSquare,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ProjectStatus } from "@/lib/types";

interface WorkspaceNavbarProps {
  projectName: string;
  projectStatus: ProjectStatus;
  isOwner: boolean;
  isAiSidebarOpen: boolean;
  isAiActive: boolean;
  isChatOpen: boolean;
  onAiSidebarToggle: () => void;
  onChatToggle: () => void;
  onShareOpen: () => void;
  onStarterTemplatesOpen: () => void;
  onStatusChange: (status: ProjectStatus) => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  DRAFT: "border-border-default bg-elevated text-text-muted",
  ACTIVE: "border-state-success/20 bg-state-success/10 text-state-success",
  ARCHIVED: "border-border-default bg-subtle text-text-faint",
};

const STATUS_TEXT: Record<ProjectStatus, string> = {
  DRAFT: "text-text-muted",
  ACTIVE: "text-state-success",
  ARCHIVED: "text-text-faint",
};

const ALL_STATUSES: ProjectStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

export function WorkspaceNavbar({
  projectName,
  projectStatus,
  isOwner,
  isAiSidebarOpen,
  isAiActive,
  isChatOpen,
  onAiSidebarToggle,
  onChatToggle,
  onShareOpen,
  onStarterTemplatesOpen,
  onStatusChange,
}: WorkspaceNavbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-default bg-surface/95 px-3 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          href="/editor"
          className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-text-muted transition-colors hover:bg-elevated hover:text-text-primary"
        >
          <Home className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Projects</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-faint" />
        <span className="max-w-[34vw] truncate font-semibold text-text-primary">
          {projectName}
        </span>

        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`hidden cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold outline-none transition-colors hover:border-border-strong sm:inline-flex ${STATUS_COLORS[projectStatus]}`}
            >
              {STATUS_LABELS[projectStatus]}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-32">
              {ALL_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className={STATUS_TEXT[status]}>
                    {STATUS_LABELS[status]}
                  </span>
                  {projectStatus === status && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline-flex ${STATUS_COLORS[projectStatus]}`}>
            {STATUS_LABELS[projectStatus]}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-text-muted hover:bg-elevated hover:text-text-primary"
          onClick={onStarterTemplatesOpen}
          aria-label="Open starter templates"
          title="Starter templates"
        >
          <LayoutTemplate className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-text-muted hover:bg-elevated hover:text-text-primary"
          onClick={onShareOpen}
          aria-label="Share project"
          title="Share project"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant={isChatOpen ? "secondary" : "ghost"}
          size="icon"
          className={`h-8 w-8 rounded-xl transition-colors ${
            isChatOpen
              ? "bg-accent-collab-dim text-accent-collab"
              : "text-text-muted hover:bg-elevated hover:text-text-primary"
          }`}
          onClick={onChatToggle}
          aria-label="Toggle room chat"
          title="Room chat"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant={isAiSidebarOpen ? "secondary" : "ghost"}
          size="icon"
          className={`relative h-8 w-8 rounded-xl transition-colors ${
            isAiSidebarOpen
              ? "bg-accent-ai-dim text-accent-ai-text"
              : "text-text-muted hover:bg-elevated hover:text-text-primary"
          }`}
          onClick={onAiSidebarToggle}
          aria-label={
            isAiActive ? "Ghost AI is working — open sidebar" : "Toggle AI assistant"
          }
          title={isAiActive ? "Ghost AI is working" : "Ghost AI"}
        >
          <BrainCircuit className="h-4 w-4" />
          {isAiActive && (
            <span
              aria-hidden
              className="absolute right-1 top-1 flex h-1.5 w-1.5"
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-ai-text opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-ai-text" />
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
