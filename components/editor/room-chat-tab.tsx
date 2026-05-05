"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
} from "@liveblocks/react";
import { Bot, Send, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { parseChatMessage, CHAT_MAX_CONTENT_LENGTH } from "@/types/chat";
import type { FeedCreateMetadata } from "@liveblocks/client";
import type { AiChatFeedMetadata } from "@/liveblocks.config";

const FEED_ID = "ai-chat";

interface RoomChatTabProps {
  projectId: string;
}

export function RoomChatTab({ projectId }: RoomChatTabProps) {
  const { user } = useUser();
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const { messages, isLoading, error } = useFeedMessages(FEED_ID);

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [feedReady, setFeedReady] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const isComposingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const feedCreateAttemptedRef = useRef(false);

  // Ensure the ai-chat feed exists once on mount
  useEffect(() => {
    if (feedCreateAttemptedRef.current) return;
    feedCreateAttemptedRef.current = true;

    const metadata: AiChatFeedMetadata = { kind: "room-chat", projectId };
    createFeed(FEED_ID, { metadata: metadata as unknown as FeedCreateMetadata })
      .then(() => setFeedReady(true))
      .catch(() => {
        // Feed likely already exists — treat as success
        setFeedReady(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track whether user is at the bottom of the scroll container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 40;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending || !user) return;
    if (trimmed.length > CHAT_MAX_CONTENT_LENGTH) return;

    setSendError(null);
    setIsSending(true);

    const senderId = user.id;
    const senderName =
      user.fullName ??
      user.primaryEmailAddress?.emailAddress ??
      "Unknown";
    const senderAvatarUrl = user.imageUrl ?? null;

    const messageId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      await createFeedMessage(
        FEED_ID,
        {
          kind: "chat-message",
          role: "user",
          senderId,
          senderName,
          senderAvatarUrl,
          content: trimmed,
        },
        { id: messageId }
      );
      setDraft("");
    } catch {
      setSendError("Failed to send. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, user, createFeedMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  const retryFeedCreate = useCallback(() => {
    feedCreateAttemptedRef.current = false;
    setFeedError(false);
    const metadata: AiChatFeedMetadata = { kind: "room-chat", projectId };
    createFeed(FEED_ID, { metadata: metadata as unknown as FeedCreateMetadata })
      .then(() => setFeedReady(true))
      .catch(() => {
        setFeedReady(true);
      });
  }, [createFeed, projectId]);

  // Validated and sorted messages
  const validMessages = (messages ?? [])
    .map((msg) => {
      const parsed = parseChatMessage(msg.data);
      if (!parsed) return null;
      return { id: msg.id, createdAt: msg.createdAt, data: parsed };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => a.createdAt - b.createdAt);

  const currentUserId = user?.id;

  if (feedError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8">
        <AlertCircle className="h-6 w-6 text-text-muted" />
        <p className="text-center text-xs text-text-muted">
          Could not connect to room chat.
        </p>
        <button
          type="button"
          onClick={retryFeedCreate}
          className="rounded-lg border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-subtle"
        >
          Retry
        </button>
      </div>
    );
  }

  const showLoading = isLoading || !feedReady;
  const showError = !!error && !isLoading;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Message list */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {showLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-text-faint" />
          </div>
        ) : showError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4">
            <AlertCircle className="h-5 w-5 text-text-muted" />
            <p className="text-center text-xs text-text-muted">
              Could not load messages.
            </p>
          </div>
        ) : validMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle">
              <MessageSquare className="h-4 w-4 text-text-faint" />
            </div>
            <p className="text-xs text-text-faint">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-3 py-3">
            {validMessages.map((msg, i) => {
              const isAssistant = msg.data.role === "assistant";
              const isOwn = !isAssistant && msg.data.senderId === currentUserId;
              const prev = i > 0 ? validMessages[i - 1] : null;
              const showSender =
                !prev || prev.data.senderId !== msg.data.senderId;
              const timestamp = new Date(msg.createdAt).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              );

              if (isAssistant) {
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${showSender && i > 0 ? "mt-3" : "mt-0.5"}`}
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-ai-dim">
                      <Bot className="h-3 w-3 text-accent-ai-text" />
                    </div>
                    <div className="group relative max-w-[85%] rounded-2xl rounded-tl-sm border border-border-default bg-surface px-3 py-2 text-xs leading-relaxed text-text-secondary shadow-sm">
                      {msg.data.content}
                      <span className="pointer-events-none ml-2 select-none text-[9px] opacity-0 transition-opacity group-hover:opacity-60">
                        {timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${showSender && i > 0 ? "mt-3" : "mt-0.5"}`}
                >
                  {showSender && !isOwn && (
                    <span className="mb-0.5 ml-1 text-[10px] text-text-faint">
                      {msg.data.senderName}
                    </span>
                  )}
                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      isOwn
                        ? "rounded-tr-sm border border-accent-primary/20 bg-accent-primary-dim text-text-primary"
                        : "rounded-tl-sm border border-border-default bg-surface text-text-secondary shadow-sm"
                    }`}
                  >
                    {msg.data.content}
                    <span className="pointer-events-none ml-2 select-none text-[9px] opacity-0 transition-opacity group-hover:opacity-60">
                      {timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border-default p-3">
        {sendError && (
          <p className="mb-2 text-center text-[10px] text-text-muted">
            {sendError}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-border-default bg-elevated p-2">
          <textarea
            value={draft}
            onChange={(e) => {
              setSendError(null);
              setDraft(e.target.value.slice(0, CHAT_MAX_CONTENT_LENGTH));
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            placeholder="Message room..."
            rows={1}
            disabled={isSending}
            style={{ minHeight: "36px", maxHeight: "120px" }}
            className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-faint focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!draft.trim() || isSending}
            aria-label="Send message"
            className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent-primary text-text-inverse transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-text-faint">
          Enter to send - Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
