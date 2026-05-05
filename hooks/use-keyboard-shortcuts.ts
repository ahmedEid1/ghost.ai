"use client";

import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.getAttribute("contenteditable") != null) return true;
  return !!target.closest("[contenteditable]");
}

export function useKeyboardShortcuts({
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onSave,
  onDelete,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod) {
        const key = e.key.toLowerCase();
        if (key === "s") {
          e.preventDefault();
          onSave?.();
          return;
        }
        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            onRedo?.();
          } else {
            onUndo?.();
          }
          return;
        }
        if (key === "y") {
          e.preventDefault();
          onRedo?.();
          return;
        }
        return;
      }

      // Non-modifier zoom shortcuts — only when no modifier is held
      if (!e.shiftKey && !e.altKey) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          onZoomIn?.();
          return;
        }
        if (e.key === "-") {
          e.preventDefault();
          onZoomOut?.();
          return;
        }
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          onDelete?.();
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onZoomIn, onZoomOut, onUndo, onRedo, onSave, onDelete]);
}
