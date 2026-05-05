"use client";

import Link from "next/link";
import {
  FolderKanban,
  Ghost,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  projectCount: number;
  onCreateProject: () => void;
  onSidebarToggle: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  projectCount,
  onCreateProject,
  onSidebarToggle,
}: EditorNavbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border-default bg-surface/90 px-3 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-all duration-150 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="h-9 w-9 rounded-xl border border-border-subtle bg-elevated/70 text-text-muted transition-all duration-150 hover:border-border-strong hover:bg-surface hover:text-text-primary"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        <Link
          href="/editor"
          className="group flex min-w-0 items-center gap-2 rounded-2xl py-1 pr-2 transition-all duration-150 hover:bg-elevated/80"
          aria-label="Ghost AI projects"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-default bg-canvas text-text-inverse shadow-[var(--shadow-soft)] transition-all duration-150 group-hover:border-accent-primary">
            <Ghost className="h-5 w-5" />
          </div>
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="text-sm font-semibold text-text-primary">
              Ghost<span className="text-accent-primary">AI</span>
            </p>
            <p className="text-[11px] font-medium text-text-muted">
              Systems Studio
            </p>
          </div>
        </Link>
      </div>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-border-default bg-elevated/75 p-1 lg:flex">
        <Link
          href="/editor"
          aria-current="page"
          className="inline-flex h-8 items-center gap-2 rounded-xl border border-border-default bg-surface px-3 text-xs font-semibold text-text-primary transition-all duration-150"
        >
          <FolderKanban className="h-3.5 w-3.5 text-accent-primary" />
          Projects
          <span className="inline-flex min-w-5 justify-center rounded-full bg-accent-primary-dim px-1.5 text-[10px] font-semibold text-accent-primary tabular-nums">
            {projectCount}
          </span>
        </Link>
        <Link
          href="/ui-showcase"
          className="inline-flex h-8 items-center gap-2 rounded-xl px-3 text-xs font-medium text-text-muted transition-all duration-150 hover:bg-surface hover:text-text-primary"
        >
          <Palette className="h-3.5 w-3.5" />
          Design
        </Link>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/ui-showcase"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface text-text-muted transition-all duration-150 hover:border-accent-primary hover:bg-accent-primary-dim hover:text-accent-primary lg:hidden"
          title="Design system"
          aria-label="Open design system"
        >
          <Palette className="h-4 w-4" />
        </Link>
        <Button
          onClick={onCreateProject}
          className="h-9 rounded-xl bg-accent-primary px-3 text-xs font-semibold text-text-inverse transition-all duration-150 hover:bg-[var(--accent-primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New project</span>
        </Button>
        <UserButton />
      </div>
    </header>
  );
}
