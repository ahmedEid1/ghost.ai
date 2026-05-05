"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2, CloudUpload, Dot } from "lucide-react";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface CanvasSaveStatusProps {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  hasPendingChanges: boolean;
  onSave: () => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 15) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function CanvasSaveStatus({
  saveStatus,
  lastSavedAt,
  hasPendingChanges,
  onSave,
}: CanvasSaveStatusProps) {
  const [, setTick] = useState(0);

  // Re-render every 30s to keep the relative timestamp fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const isVisible = saveStatus !== "idle";
  if (!isVisible) return null;

  const isSaving = saveStatus === "saving";
  const isError = saveStatus === "error";
  const isPending = saveStatus === "pending" || hasPendingChanges;

  return (
    <div
      className="canvas-panel absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-2xl px-2 py-1.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
      style={{
        borderColor: isError ? "var(--state-error)" : "var(--border-default)",
        opacity: isPending && !isSaving ? 0.7 : 1,
        transition: "opacity 0.2s ease, border-color 0.2s ease",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Save button / status icon */}
      <button
        onClick={onSave}
        disabled={isSaving}
        aria-label={isError ? "Retry save (Ctrl+S)" : "Save canvas (Ctrl+S)"}
        title={isError ? "Retry (Ctrl+S)" : "Save now (Ctrl+S)"}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-elevated disabled:cursor-not-allowed"
        style={{ color: isError ? "var(--state-error)" : isSaving ? "var(--text-muted)" : isPending ? "var(--text-muted)" : "var(--accent-primary)" }}
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : isError ? (
          <CloudOff className="h-3.5 w-3.5" aria-hidden />
        ) : isPending ? (
          <CloudUpload className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Cloud className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>

      {/* Divider */}
      <div
        className="h-3.5 w-px flex-shrink-0"
        style={{ background: "var(--border-subtle)" }}
      />

      {/* Status text */}
      <div
        className="flex items-center gap-1 text-[11px] leading-none"
        role="status"
        aria-live="polite"
        aria-label={statusLabel(saveStatus, lastSavedAt)}
      >
        {isSaving && (
          <span style={{ color: "var(--text-muted)" }}>Saving...</span>
        )}

        {isError && (
          <>
            <span style={{ color: "var(--state-error)" }}>Save failed</span>
            <Dot className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden />
            <button
              onClick={onSave}
              className="underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: "var(--state-error)" }}
              aria-label="Retry save"
            >
              Retry
            </button>
          </>
        )}

        {isPending && !isSaving && (
          <span style={{ color: "var(--text-muted)" }}>Unsaved changes</span>
        )}

        {saveStatus === "saved" && !hasPendingChanges && lastSavedAt && (
          <>
            <span style={{ color: "var(--text-secondary)" }}>Saved</span>
            <Dot className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden />
            <span style={{ color: "var(--text-muted)" }}>{timeAgo(lastSavedAt)}</span>
          </>
        )}

        {saveStatus === "saved" && !hasPendingChanges && !lastSavedAt && (
          <span style={{ color: "var(--text-secondary)" }}>Saved</span>
        )}
      </div>
    </div>
  );
}

function statusLabel(status: SaveStatus, lastSavedAt: Date | null): string {
  switch (status) {
    case "saving": return "Saving canvas...";
    case "saved": return lastSavedAt ? `Canvas saved ${timeAgo(lastSavedAt)}` : "Canvas saved";
    case "error": return "Canvas save failed";
    case "pending": return "Unsaved changes";
    default: return "";
  }
}
