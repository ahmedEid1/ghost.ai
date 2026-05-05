"use client";

import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  itemCount: number;
  onDelete: () => void;
  onClose: () => void;
}

export function CanvasContextMenu({
  x,
  y,
  itemCount,
  onDelete,
  onClose,
}: CanvasContextMenuProps) {
  const onCloseRef = useRef(onClose);
  const onDeleteRef = useRef(onDelete);
  onCloseRef.current = onClose;
  onDeleteRef.current = onDelete;

  // Click-outside and Escape dismiss — use stable refs so the listener is
  // registered once and never re-added due to prop reference churn.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    const handlePointerDown = (e: PointerEvent) => {
      const menu = document.getElementById("canvas-context-menu");
      if (menu && !menu.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    // Use pointerdown in capture phase so this fires before React synthetic events
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  // Empty deps — stable via refs; only runs once on mount and cleans up on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = itemCount > 1 ? `Delete ${itemCount} items` : "Delete";

  return (
    <div
      id="canvas-context-menu"
      role="menu"
      aria-label="Canvas context menu"
      // Stop ALL pointer events from bubbling to the canvas so React Flow never
      // sees clicks on the menu as pane interactions.
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 9999,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        minWidth: 160,
        padding: "4px",
      }}
    >
      <button
        role="menuitem"
        onPointerDown={(e) => {
          e.stopPropagation();
          // Fire deletion on pointerdown (before any focus-change events)
          // so React Flow's blur/deselect cycle cannot interfere.
          onDeleteRef.current();
          onCloseRef.current();
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface focus:bg-surface focus:outline-none"
        style={{ color: "var(--color-error, #f87171)" }}
      >
        <Trash2 size={14} aria-hidden />
        {label}
      </button>
    </div>
  );
}
