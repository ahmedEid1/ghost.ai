"use client";

import { BrainCircuit, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border-default bg-surface">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border-default px-3">
        <div className="flex items-center gap-2">
          <BrainCircuit
            className="h-4 w-4"
            style={{ color: "var(--accent-ai-text)" }}
          />
          <span className="text-sm font-medium text-text-primary">
            AI Assistant
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-text-muted hover:text-text-primary"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--accent-primary-dim)" }}
        >
          <BrainCircuit
            className="h-6 w-6"
            style={{ color: "var(--accent-ai-text)" }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">
            AI Assistant
          </p>
          <p className="text-xs leading-relaxed text-text-muted">
            Describe what you&apos;d like to design and the AI will build it
            on your canvas.
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border-default p-3">
        <div className="flex items-end gap-2 rounded-xl bg-elevated p-2">
          <textarea
            rows={2}
            placeholder="Describe a system or feature to design…"
            disabled
            className="flex-1 resize-none bg-transparent text-xs text-text-muted placeholder:text-text-faint focus:outline-none"
          />
          <Button
            size="icon"
            disabled
            className="h-7 w-7 shrink-0 rounded-lg"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-text-faint">
          AI generation coming soon
        </p>
      </div>
    </aside>
  );
}
