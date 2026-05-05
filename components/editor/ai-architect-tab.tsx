"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCreateFeed, useCreateFeedMessage } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { FeedCreateMetadata } from "@liveblocks/client";
import type { AiChatFeedMetadata, AiStatusEvent } from "@/liveblocks.config";
import type { AiActivityState } from "@/hooks/use-ai-activity-state";
import { AiPhaseStepper, type AiPhaseStep } from "@/components/editor/ai-phase-stepper";

const FEED_ID = "ai-chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStatus?: boolean;
  phase?: AiStatusEvent["phase"];
  runId?: string;
}

interface AiArchitectTabProps {
  projectId: string;
  aiActivity: AiActivityState;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const PHASE_LABELS: Record<AiStatusEvent["phase"], string> = {
  "started":        "Starting...",
  "reading-canvas": "Reading canvas...",
  "planning":       "Planning with Claude...",
  "validating":     "Validating plan...",
  "applying":       "Applying changes...",
  "complete":       "Done",
  "error":          "Error",
};

const ARCHITECT_PHASE_STEPS: AiPhaseStep[] = [
  { id: "reading-canvas", label: "Reading canvas..." },
  { id: "planning",       label: "Planning with Claude..." },
  { id: "validating",     label: "Validating plan..." },
  { id: "applying",       label: "Applying changes..." },
];

// Invisible component subscribes to the Trigger.dev run via useRealtimeRun
// and fires onComplete when the run reaches a terminal state.
interface RunTrackerProps {
  runId: string;
  publicToken: string;
  onComplete: (succeeded: boolean) => void;
}

function RunTracker({ runId, publicToken, onComplete }: RunTrackerProps) {
  const hasCompletedRef = useRef(false);
  // Always use the latest onComplete without re-subscribing
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const { run } = useRealtimeRun(runId, { accessToken: publicToken });
  const runStatus = run?.status;

  useEffect(() => {
    if (!runStatus || hasCompletedRef.current) return;
    const TERMINAL = new Set([
      "COMPLETED", "FAILED", "CANCELED", "CRASHED",
      "TIMED_OUT", "INTERRUPTED", "SYSTEM_FAILURE", "EXPIRED",
    ]);
    if (TERMINAL.has(runStatus)) {
      hasCompletedRef.current = true;
      onCompleteRef.current(runStatus === "COMPLETED");
    }
  }, [runStatus]);

  return null;
}

function StarterPromptChip({
  label,
  onClick,
}: {
  label: string;
  onClick: (label: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className="w-full rounded-xl border border-border-default bg-subtle px-3 py-2 text-left text-xs leading-relaxed text-text-muted transition-colors hover:border-border-subtle hover:text-text-secondary"
    >
      {label}
    </button>
  );
}

function ChatBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-accent-primary/20 bg-accent-primary-dim px-3 py-2 text-sm leading-relaxed text-text-primary">
          {message.content}
        </div>
      </div>
    );
  }

  const isRunning =
    message.isStatus &&
    message.phase !== "complete" &&
    message.phase !== "error";

  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-ai-dim">
        {isRunning ? (
          <Loader2 className="h-3 w-3 animate-spin text-accent-ai-text" />
        ) : (
          <Bot className="h-3 w-3 text-accent-ai-text" />
        )}
      </div>
      <div
        className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border-default bg-surface px-3 py-2 text-sm leading-relaxed text-text-secondary shadow-sm"
        style={message.phase === "error" ? { color: "var(--state-error)" } : undefined}
      >
        {message.content}
      </div>
    </div>
  );
}

export function AiArchitectTab({ projectId, aiActivity }: AiArchitectTabProps) {
  const { user } = useUser();
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [localRunning, setLocalRunning] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const feedCreateAttemptedRef = useRef(false);

  // Composer is disabled when the local fetch is in flight OR a shared run is active
  const isRunning = localRunning || aiActivity.isActive;

  // Ensure the ai-chat feed exists (idempotent — treats "already exists" as success)
  useEffect(() => {
    if (feedCreateAttemptedRef.current) return;
    feedCreateAttemptedRef.current = true;
    const metadata: AiChatFeedMetadata = { kind: "room-chat", projectId };
    createFeed(FEED_ID, { metadata: metadata as unknown as FeedCreateMetadata }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-size textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const clamped = Math.min(Math.max(textarea.scrollHeight, 72), 160);
    textarea.style.height = `${clamped}px`;
  }, [draft]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reflect validated shared AI_STATUS events into the local chat history
  const { latestStatus } = aiActivity;
  useEffect(() => {
    if (!latestStatus) return;
    if (latestStatus.projectId !== projectId) return;

    const phase = latestStatus.phase;
    const label = PHASE_LABELS[phase] ?? latestStatus.message;
    const content =
      phase === "complete" || phase === "error" ? latestStatus.message : label;

    setMessages((prev) => {
      const lastIdx = prev.findLastIndex((m) => m.isStatus && m.role === "assistant");

      if (lastIdx !== -1 && prev[lastIdx].runId === latestStatus.runId) {
        const updated = [...prev];
        updated[lastIdx] = { ...updated[lastIdx], content, phase };
        return updated;
      }

      return [
        ...prev,
        {
          id: `status-${latestStatus.runId}-${phase}`,
          role: "assistant",
          content,
          isStatus: true,
          phase,
          runId: latestStatus.runId,
        },
      ];
    });

    if (phase === "complete" || phase === "error") {
      setLocalRunning(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestStatus]);

  // Called by RunTracker when the Trigger.dev run reaches a terminal state
  const handleRunComplete = useCallback(
    (succeeded: boolean) => {
      setLocalRunning(false);
      setActiveRunId(null);
      setPublicToken(null);

      const content = succeeded
        ? "Design applied to canvas successfully."
        : "Design run did not complete successfully.";

      void createFeedMessage(
        FEED_ID,
        {
          kind: "chat-message",
          role: "assistant",
          senderId: "ghost-ai",
          senderName: "Ghost AI",
          senderAvatarUrl: null,
          content,
        },
        { id: `ghost-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
      ).catch(() => {});
    },
    [createFeedMessage]
  );

  const handleChipClick = useCallback((label: string) => {
    setDraft(label);
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || isRunning) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: trimmed },
    ]);
    setDraft("");
    setLocalRunning(true);
    textareaRef.current?.focus();

    // Push user prompt to the shared ai-chat feed for cross-session visibility
    if (user) {
      void createFeedMessage(
        FEED_ID,
        {
          kind: "chat-message",
          role: "user",
          senderId: user.id,
          senderName:
            user.fullName ??
            user.primaryEmailAddress?.emailAddress ??
            "User",
          senderAvatarUrl: user.imageUrl ?? null,
          content: trimmed,
        },
        { id: `user-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
      ).catch(() => {});
    }

    try {
      // 1. Trigger the design run
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId: projectId, projectId }),
      });

      const data: unknown = await res.json();

      if (
        !res.ok ||
        typeof data !== "object" ||
        data === null ||
        !(data as Record<string, unknown>).ok
      ) {
        const errMsg =
          typeof data === "object" && data !== null
            ? String(
                (data as Record<string, unknown>).error ??
                  "Failed to start design agent",
              )
            : "Failed to start design agent";
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: errMsg,
            isStatus: true,
            phase: "error",
          },
        ]);
        setLocalRunning(false);
        return;
      }

      const runId = String((data as Record<string, unknown>).runId ?? "");
      if (!runId) {
        setLocalRunning(false);
        return;
      }

      // 2. Fetch a public token so useRealtimeRun can subscribe to this run
      try {
        const tokenRes = await fetch("/api/ai/design/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId }),
        });
        const tokenData: unknown = await tokenRes.json();
        if (
          tokenRes.ok &&
          typeof tokenData === "object" &&
          tokenData !== null &&
          (tokenData as Record<string, unknown>).ok
        ) {
          const token = String((tokenData as Record<string, unknown>).token ?? "");
          if (token) {
            setActiveRunId(runId);
            setPublicToken(token);
            return;
          }
        }
      } catch {
        // Non-fatal — AI_STATUS room events still drive the UI
      }

      // Token unavailable: track run ID only (no useRealtimeRun subscription)
      setActiveRunId(runId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Could not reach the server. Please try again.",
          isStatus: true,
          phase: "error",
        },
      ]);
      setLocalRunning(false);
    }
  }, [draft, isRunning, projectId, user, createFeedMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-5 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-ai-dim">
              <Sparkles className="h-6 w-6 text-accent-ai-text" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-text-primary">
                Ghost AI Architect
              </p>
              <p className="max-w-52 text-xs leading-relaxed text-text-muted">
                Describe a system and I&apos;ll design it on your canvas in
                seconds.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <StarterPromptChip
                  key={prompt}
                  label={prompt}
                  onClick={handleChipClick}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Phase stepper — only shown while a run is active */}
      {isRunning && (
        <AiPhaseStepper
          steps={ARCHITECT_PHASE_STEPS}
          currentPhase={aiActivity.phase}
          isError={aiActivity.phase === "error"}
          errorMessage={aiActivity.message}
        />
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-border-default p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border-default bg-elevated p-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            placeholder={
              isRunning
                ? "Ghost AI is working..."
                : "Describe a system or feature to design..."
            }
            rows={1}
            disabled={isRunning}
            style={{ minHeight: "72px", maxHeight: "160px" }}
            className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-faint focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!draft.trim() || isRunning}
            aria-label="Send message"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-primary text-text-inverse transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-text-faint">
          Enter to send - Shift+Enter for newline
        </p>
      </div>

      {/* Invisible Trigger.dev run tracker renders only when we have a token */}
      {activeRunId && publicToken && (
        <RunTracker
          runId={activeRunId}
          publicToken={publicToken}
          onComplete={handleRunComplete}
        />
      )}
    </div>
  );
}
