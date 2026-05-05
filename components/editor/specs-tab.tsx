"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileCode2, Download, Loader2, AlertCircle, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCreateFeed, useFeedMessages } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseChatMessage } from "@/types/chat";
import type { FeedCreateMetadata } from "@liveblocks/client";
import type { AiChatFeedMetadata } from "@/liveblocks.config";
import type { CanvasSnapshot } from "@/components/editor/canvas";
import { AiPhaseStepper, type AiPhaseStep } from "@/components/editor/ai-phase-stepper";

const FEED_ID = "ai-chat";

const SPEC_PHASE_STEPS: AiPhaseStep[] = [
  { id: "reading-canvas", label: "Reading canvas..." },
  { id: "generating",     label: "Generating with Claude..." },
  { id: "saving",         label: "Saving..." },
];

interface SpecMeta {
  id: string;
  createdAt: string;
}

interface SpecsTabProps {
  projectId: string;
  getCanvasSnapshot: () => CanvasSnapshot;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toFilename(specId: string) {
  return `spec-${specId.slice(0, 8)}.md`;
}

function triggerDownload(projectId: string, specId: string) {
  const a = document.createElement("a");
  a.href = `/api/projects/${projectId}/specs/${specId}/download`;
  a.download = toFilename(specId);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Subscribes to a Trigger.dev run and fires callbacks on phase changes and terminal state.
function RunTracker({
  runId,
  publicToken,
  onComplete,
  onPhase,
}: {
  runId: string;
  publicToken: string;
  onComplete: (succeeded: boolean) => void;
  onPhase: (phase: string) => void;
}) {
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onPhaseRef = useRef(onPhase);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onPhaseRef.current = onPhase;
  });

  const { run } = useRealtimeRun(runId, { accessToken: publicToken });

  useEffect(() => {
    if (!run) return;

    const status = (run.metadata as Record<string, unknown> | null)?.status;
    if (typeof status === "string") {
      onPhaseRef.current(status);
    }

    if (hasCompletedRef.current) return;
    const TERMINAL = new Set([
      "COMPLETED", "FAILED", "CANCELED", "CRASHED",
      "TIMED_OUT", "INTERRUPTED", "SYSTEM_FAILURE", "EXPIRED",
    ]);
    if (TERMINAL.has(run.status)) {
      hasCompletedRef.current = true;
      onCompleteRef.current(run.status === "COMPLETED");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status, run?.metadata]);

  return null;
}

export function SpecsTab({ projectId, getCanvasSnapshot }: SpecsTabProps) {
  // Spec list state
  const [specs, setSpecs] = useState<SpecMeta[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Generate state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  // Preview modal state
  const [selectedSpec, setSelectedSpec] = useState<SpecMeta | null>(null);
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Liveblocks feed for chat history context
  const createFeed = useCreateFeed();
  const { messages: feedMessages } = useFeedMessages(FEED_ID);
  const feedAttemptedRef = useRef(false);

  // Ensure the ai-chat feed exists (same idempotent pattern used in other tabs)
  useEffect(() => {
    if (feedAttemptedRef.current) return;
    feedAttemptedRef.current = true;
    const meta: AiChatFeedMetadata = { kind: "room-chat", projectId };
    createFeed(FEED_ID, { metadata: meta as unknown as FeedCreateMetadata }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spec list fetcher
  const fetchSpecs = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as unknown;
      if (
        typeof data === "object" &&
        data !== null &&
        "specs" in data &&
        Array.isArray((data as { specs: unknown }).specs)
      ) {
        setSpecs((data as { specs: SpecMeta[] }).specs);
        setListError(null);
      } else {
        setListError("Unexpected response from server.");
      }
    } catch {
      setListError("Failed to load specs.");
    } finally {
      setListLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchSpecs();
    });

    return () => {
      cancelled = true;
    };
  }, [fetchSpecs]);

  // Generate handler
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;

    const { nodes, edges } = getCanvasSnapshot();
    if (nodes.length === 0) {
      setGenerateError("Canvas is empty - add some components first.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setCurrentPhase("reading-canvas");

    // Build chat history from the last 30 validated feed messages for context
    const chatHistory = (feedMessages ?? [])
      .slice(-30)
      .map((msg) => parseChatMessage(msg.data))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      // 1. Trigger the spec generation task
      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: projectId, nodes, edges, chatHistory }),
      });
      const specData = (await specRes.json()) as unknown;

      if (
        !specRes.ok ||
        typeof specData !== "object" ||
        specData === null ||
        !(specData as Record<string, unknown>).ok
      ) {
        const msg =
          typeof specData === "object" && specData !== null
            ? String(
                (specData as Record<string, unknown>).error ??
                  "Failed to start generation",
              )
            : "Failed to start generation";
        setGenerateError(msg);
        setIsGenerating(false);
        return;
      }

      const runId = String((specData as Record<string, unknown>).runId ?? "");
      if (!runId) {
        setIsGenerating(false);
        return;
      }

      // 2. Fetch a public token for realtime run tracking
      try {
        const tokenRes = await fetch("/api/ai/spec/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId }),
        });
        const tokenData = (await tokenRes.json()) as unknown;
        if (
          tokenRes.ok &&
          typeof tokenData === "object" &&
          tokenData !== null &&
          (tokenData as Record<string, unknown>).ok
        ) {
          const token = String(
            (tokenData as Record<string, unknown>).token ?? "",
          );
          if (token) {
            setActiveRunId(runId);
            setPublicToken(token);
            return;
          }
        }
      } catch {
        // Non-fatal: continue without realtime updates
      }

      // Token unavailable: still track the run ID for display purposes
      setActiveRunId(runId);
    } catch {
      setGenerateError("Could not reach the server. Please try again.");
      setIsGenerating(false);
    }
  }, [isGenerating, getCanvasSnapshot, projectId, feedMessages]);

  // Called by RunTracker when the run reaches a terminal state
  const handleRunComplete = useCallback(
    async (succeeded: boolean) => {
      setIsGenerating(false);
      setActiveRunId(null);
      setPublicToken(null);
      setCurrentPhase(null);

      if (!succeeded) {
        setGenerateError("Spec generation failed. Please try again.");
        return;
      }

      // Refresh the spec list to show the newly created spec
      await fetchSpecs();
    },
    [fetchSpecs],
  );

  // Preview modal handlers
  const handleSpecClick = useCallback(
    (spec: SpecMeta) => {
      setSelectedSpec(spec);
      setSpecContent(null);
      setContentError(null);
      setContentLoading(true);

      fetch(`/api/projects/${projectId}/specs/${spec.id}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.text();
        })
        .then((text) => setSpecContent(text))
        .catch(() => setContentError("Could not load spec content."))
        .finally(() => setContentLoading(false));
    },
    [projectId],
  );

  const handleDownload = useCallback(
    (specId: string) => triggerDownload(projectId, specId),
    [projectId],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Generate button / phase stepper */}
      <div className="shrink-0 border-b border-border-default">
        {isGenerating ? (
          <AiPhaseStepper
            steps={SPEC_PHASE_STEPS}
            currentPhase={currentPhase}
          />
        ) : (
          <div className="p-3">
            <button
              type="button"
              onClick={() => void handleGenerate()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-2.5 text-sm font-semibold text-text-inverse transition-opacity hover:opacity-90"
            >
              <Wand2 className="h-4 w-4" />
              Generate Spec
            </button>
            {generateError && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-text-muted">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{generateError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spec list */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-3">
          {listLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading specs...</span>
            </div>
          )}

          {!listLoading && listError && (
            <div className="flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs text-text-muted">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {listError}
            </div>
          )}

          {!listLoading && !listError && specs.length === 0 && (
            <div className="py-10 text-center">
              <FileCode2 className="mx-auto mb-3 h-8 w-8 text-text-faint" />
              <p className="text-xs text-text-faint">No specs yet.</p>
              <p className="mt-1 text-xs text-text-faint">
                Click Generate Spec above.
              </p>
            </div>
          )}

          {!listLoading &&
            !listError &&
            specs.map((spec) => (
              <div
                key={spec.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSpecClick(spec)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSpecClick(spec);
                  }
                }}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-default bg-elevated px-3 py-2.5 transition-colors hover:border-border-subtle"
              >
                <FileCode2 className="h-4 w-4 shrink-0 text-accent-ai-text" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium text-text-primary">
                    {toFilename(spec.id)}
                  </span>
                  <span className="text-[10px] text-text-faint">
                    {formatDate(spec.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(spec.id);
                  }}
                  aria-label={`Download ${toFilename(spec.id)}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-subtle hover:text-text-secondary"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
        </div>
      </ScrollArea>

      {/* Preview modal */}
      <Dialog
        open={!!selectedSpec}
        onOpenChange={(open) => {
          if (!open) setSelectedSpec(null);
        }}
      >
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-0 overflow-hidden border-border-default bg-surface p-0">
          <DialogHeader className="flex shrink-0 flex-row items-center gap-3 border-b border-border-default px-5 py-4">
            <FileCode2 className="h-4 w-4 shrink-0 text-accent-ai-text" />
            <DialogTitle className="flex-1 truncate text-sm font-semibold text-text-primary">
              {selectedSpec ? toFilename(selectedSpec.id) : ""}
            </DialogTitle>
            {selectedSpec && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(selectedSpec.id)}
                className="h-7 gap-1.5 rounded-lg text-xs text-text-muted hover:text-text-secondary"
                aria-label="Download spec"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="px-5 py-4">
              {contentLoading && (
                <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              )}

              {!contentLoading && contentError && (
                <div className="flex items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-xs text-text-muted">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {contentError}
                </div>
              )}

              {!contentLoading && specContent && (
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-3 text-lg font-bold text-text-primary">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-2 mt-5 text-base font-semibold text-text-primary">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-1.5 mt-4 text-sm font-semibold text-text-primary">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 text-sm leading-relaxed text-text-secondary">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 ml-4 list-disc text-sm text-text-secondary">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 ml-4 list-decimal text-sm text-text-secondary">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-0.5 leading-relaxed">{children}</li>
                    ),
                    pre: ({ children }) => (
                      <pre className="mb-3 overflow-x-auto rounded-xl bg-subtle p-3">
                        {children}
                      </pre>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs text-text-secondary">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="mb-2 border-l-2 border-border-subtle pl-3 text-sm text-text-muted">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-4 border-border-default" />,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-text-primary">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-text-secondary">{children}</em>
                    ),
                  }}
                >
                  {specContent}
                </ReactMarkdown>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Invisible run tracker mounts only when we have a token */}
      {activeRunId && publicToken && (
        <RunTracker
          runId={activeRunId}
          publicToken={publicToken}
          onComplete={(ok) => void handleRunComplete(ok)}
          onPhase={setCurrentPhase}
        />
      )}
    </div>
  );
}
