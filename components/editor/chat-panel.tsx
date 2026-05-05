"use client";

import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomChatTab } from "@/components/editor/room-chat-tab";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ChatPanel({ isOpen, onClose, projectId }: ChatPanelProps) {
  if (!isOpen) return null;

  return (
    <aside className="ml-2 flex w-[21rem] shrink-0 flex-col overflow-hidden rounded-3xl border border-border-default bg-surface shadow-[var(--shadow-panel)] animate-slide-in-right transition-all duration-300">
      <div className="flex shrink-0 items-center justify-between border-b border-border-default bg-surface px-4 py-3 transition-all duration-150">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-collab-dim transition-all duration-200">
            <MessageSquare className="h-4 w-4 text-accent-collab" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">Room Chat</p>
            <p className="text-xs text-text-muted mt-0.5">Chat with collaborators</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-text-muted transition-all duration-150 hover:bg-elevated hover:text-text-primary"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RoomChatTab projectId={projectId} />
      </div>
    </aside>
  );
}
