"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const ASSISTANT_ACK =
  "I've received your request. AI generation will be wired up in an upcoming release — your prompt is ready to go!";

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
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border-subtle bg-accent-primary-dim px-3 py-2 text-sm leading-relaxed text-text-primary">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-primary-dim">
        <Bot className="h-3 w-3 text-accent-ai-text" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border-default bg-elevated px-3 py-2 text-sm leading-relaxed text-text-secondary">
        {message.content}
      </div>
    </div>
  );
}

export function AiArchitectTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const clamped = Math.min(Math.max(textarea.scrollHeight, 72), 160);
    textarea.style.height = `${clamped}px`;
  }, [draft]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChipClick = useCallback((label: string) => {
    setDraft(label);
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: trimmed },
      {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        content: ASSISTANT_ACK,
      },
    ]);
    setDraft("");
    textareaRef.current?.focus();
  }, [draft]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
        e.preventDefault();
        handleSubmit();
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-primary-dim">
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
            placeholder="Describe a system or feature to design…"
            rows={1}
            style={{ minHeight: "72px", maxHeight: "160px" }}
            className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-primary transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ color: "white" }}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-text-faint">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
