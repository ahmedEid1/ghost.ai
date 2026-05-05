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
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  // Focus the delete button on open for keyboard accessibility
  useEffect(() => {
    deleteRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose]);

  const label = itemCount > 1 ? `Delete ${itemCount} items` : "Delete";

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Canvas context menu"
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
        ref={deleteRef}
        role="menuitem"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface focus:bg-surface focus:outline-none"
        style={{ color: "var(--color-error, #f87171)" }}
      >
        <Trash2 size={14} />
        {label}
      </button>
    </div>
  );
}
