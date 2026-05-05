"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: unknown[];
  edges: unknown[];
  enabled: boolean;
  debounceMs?: number;
}

interface UseCanvasAutosaveResult {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  hasPendingChanges: boolean;
  triggerSave: () => void;
}

// Stable serialization: sort by id so drag-order changes in the array
// don't produce a different hash for identical graph content.
function stableSerialize(nodes: unknown[], edges: unknown[]): string {
  const sortById = (a: unknown, b: unknown) => {
    const idA = typeof a === "object" && a !== null ? (a as Record<string, unknown>).id : "";
    const idB = typeof b === "object" && b !== null ? (b as Record<string, unknown>).id : "";
    return String(idA).localeCompare(String(idB));
  };
  return JSON.stringify({
    nodes: [...nodes].sort(sortById),
    edges: [...edges].sort(sortById),
  });
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
  debounceMs = 1200,
}: UseCanvasAutosaveOptions): UseCanvasAutosaveResult {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHashRef = useRef<string | null>(null);
  const currentSerializedRef = useRef<string>("");
  const isSavingRef = useRef(false);

  const executeSave = useCallback(
    async (serialized: string) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      setHasPendingChanges(false);
      setSaveStatus("saving");

      try {
        const payload = JSON.parse(serialized) as { nodes: unknown[]; edges: unknown[] };
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes: payload.nodes, edges: payload.edges }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        lastSavedHashRef.current = serialized;
        setLastSavedAt(new Date());
        setSaveStatus("saved");
      } catch (err) {
        console.error("[useCanvasAutosave] save failed", err);
        setSaveStatus("error");
      } finally {
        isSavingRef.current = false;
      }
    },
    [projectId]
  );

  // Autosave: debounce graph changes and skip duplicate content
  useEffect(() => {
    if (!enabled) return;

    const serialized = stableSerialize(nodes, edges);
    currentSerializedRef.current = serialized;

    const hasContent = nodes.length > 0 || edges.length > 0;
    if (!hasContent) return;

    if (serialized === lastSavedHashRef.current) return;

    setHasPendingChanges(true);
    if (saveStatus !== "saving") setSaveStatus("pending");

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setHasPendingChanges(false);
      executeSave(serialized);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, enabled, debounceMs, executeSave]);

  // Manual save: cancel debounce and save immediately
  const triggerSave = useCallback(() => {
    if (isSavingRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const serialized = currentSerializedRef.current;
    const hasContent = nodes.length > 0 || edges.length > 0;
    if (!hasContent) return;
    // Always save on manual trigger — even if hash matches (user expects feedback)
    executeSave(serialized);
  }, [nodes.length, edges.length, executeSave]);

  return { saveStatus, lastSavedAt, hasPendingChanges, triggerSave };
}
