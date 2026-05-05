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
  DRAFT: "border-border-default bg-elevated text-text-secondary hover:border-border-strong",
  ACTIVE: "border-state-success/30 bg-state-success/10 text-state-success hover:border-state-success/50",
  ARCHIVED: "border-border-default bg-subtle text-text-muted hover:border-border-strong",
};

const STATUS_TEXT: Record<ProjectStatus, string> = {
  DRAFT: "text-text-secondary",
  ACTIVE: "text-state-success",
  ARCHIVED: "text-text-muted",
};

const STATUS_DOT_COLORS: Record<ProjectStatus, string> = {
  DRAFT: "bg-text-faint",
  ACTIVE: "bg-state-success",
  ARCHIVED: "bg-border-strong",
};

const ALL_STATUSES: ProjectStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

const TOOL_BUTTON =
  "h-9 w-9 rounded-xl border border-transparent px-0 text-text-muted transition-all duration-150 hover:border-border-default hover:bg-elevated hover:text-text-primary xl:w-auto xl:px-3";

function StatusDot({ status }: { status: ProjectStatus }) {
  return (
    <span
      aria-hidden
      className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[status]}`}
    />
  );
}

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
  const chatButtonState = isChatOpen
    ? "border-accent-collab/30 bg-accent-collab-dim text-accent-collab hover:border-accent-collab/40 hover:bg-accent-collab-dim hover:text-accent-collab"
    : "";
  const aiButtonState = isAiSidebarOpen || isAiActive
    ? "border-accent-ai/30 bg-accent-ai-dim text-accent-ai-text hover:border-accent-ai/40 hover:bg-accent-ai-dim hover:text-accent-ai-text"
    : "";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-default bg-surface/90 px-3 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-all duration-150 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/editor"
          className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-border-subtle bg-elevated/70 px-2.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:border-border-strong hover:bg-surface hover:text-text-primary"
          aria-label="Back to projects"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Projects</span>
        </Link>

        <ChevronRight className="hidden h-4 w-4 shrink-0 text-text-faint sm:block" />

        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-[28vw] truncate text-sm font-semibold text-text-primary sm:max-w-[32vw] lg:max-w-[24rem]">
            {projectName}
          </span>

          {isOwner ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`hidden h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold outline-none transition-all duration-150 sm:inline-flex ${STATUS_COLORS[projectStatus]}`}
                aria-label="Change project status"
              >
                <StatusDot status={projectStatus} />
                {STATUS_LABELS[projectStatus]}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-36">
                {ALL_STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className="flex items-center justify-between gap-2 text-xs transition-colors duration-100"
                  >
                    <span className="flex items-center gap-2">
                      <StatusDot status={status} />
                      <span className={STATUS_TEXT[status]}>
                        {STATUS_LABELS[status]}
                      </span>
                    </span>
                    {projectStatus === status && <Check className="h-3 w-3" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className={`hidden h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-all duration-150 sm:inline-flex ${STATUS_COLORS[projectStatus]}`}>
              <StatusDot status={projectStatus} />
              {STATUS_LABELS[projectStatus]}
            </span>
          )}
        </div>
      </div>

      <div className="hidden items-center gap-1 rounded-2xl border border-border-default bg-elevated/75 p-1 xl:flex">
        <div className="inline-flex h-8 items-center gap-2 rounded-xl bg-surface px-3 text-xs font-medium text-text-secondary">
          <span className="ghost-pulse-dot h-2 w-2 rounded-full bg-accent-collab" />
          Room
        </div>
        <div
          className={`inline-flex h-8 min-w-24 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium transition-all duration-150 ${
            isAiActive
              ? "bg-accent-ai-dim text-accent-ai-text"
              : "text-text-muted"
          }`}
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          {isAiActive ? "AI running" : "AI ready"}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          className={TOOL_BUTTON}
          onClick={onStarterTemplatesOpen}
          aria-label="Open starter templates"
          title="Starter templates"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden xl:inline">Templates</span>
        </Button>
        <Button
          variant="ghost"
          className={TOOL_BUTTON}
          onClick={onShareOpen}
          aria-label="Share project"
          title="Share project"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden xl:inline">Share</span>
        </Button>
        <div className="hidden h-6 w-px rounded-full bg-border-default sm:block" />
        <Button
          variant="ghost"
          className={`${TOOL_BUTTON} ${chatButtonState}`}
          onClick={onChatToggle}
          aria-label="Toggle room chat"
          aria-pressed={isChatOpen}
          title="Room chat"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden xl:inline">Chat</span>
        </Button>
        <Button
          variant="ghost"
          className={`relative ${TOOL_BUTTON} ${aiButtonState}`}
          onClick={onAiSidebarToggle}
          aria-label={
            isAiActive ? "Ghost AI is working - open sidebar" : "Toggle AI assistant"
          }
          aria-pressed={isAiSidebarOpen}
          title={isAiActive ? "Ghost AI is working" : "Ghost AI"}
        >
          <BrainCircuit className="h-4 w-4" />
          <span className="hidden min-w-14 xl:inline">
            {isAiActive ? "Working" : "Ghost AI"}
          </span>
          {isAiActive && (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5"
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
