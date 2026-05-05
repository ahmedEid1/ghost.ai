"use client";

import { Ghost, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function EditorNavbar({ isSidebarOpen, onSidebarToggle }: EditorNavbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center justify-between border-b border-border-default bg-surface/95 px-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="h-8 w-8 text-text-muted hover:text-text-primary"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-default bg-accent-primary-dim">
            <Ghost className="h-4 w-4 text-accent-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-text-primary">
              Ghost<span className="text-accent-primary">AI</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-text-faint">
              Systems studio
            </p>
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-border-default bg-elevated px-3 py-1 text-xs font-medium text-text-secondary md:flex">
        <Sparkles className="h-3.5 w-3.5 text-accent-ai-text" />
        AI canvas to technical spec
      </div>
      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  );
}
