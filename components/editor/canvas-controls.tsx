"use client";

import { useEffect, useRef, useState } from "react";
import {
  Minus,
  Scan,
  Plus,
  Undo2,
  Redo2,
  LayoutGrid,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import type { LayoutDirection } from "@/lib/canvas-layout";

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOrganize: (direction: LayoutDirection) => void;
}

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}

function ControlButton({ onClick, disabled, label, active, children }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      style={{
        color: "var(--text-secondary)",
        background: active ? "var(--bg-elevated)" : undefined,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {children}
    </button>
  );
}

interface OrganizePopoverProps {
  onPick: (direction: LayoutDirection) => void;
}

function OrganizePopover({ onPick }: OrganizePopoverProps) {
  const items: { dir: LayoutDirection; label: string; icon: React.ReactNode }[] = [
    { dir: "TB", label: "Top to bottom",  icon: <ArrowDown  className="h-3.5 w-3.5" /> },
    { dir: "BT", label: "Bottom to top",  icon: <ArrowUp    className="h-3.5 w-3.5" /> },
    { dir: "LR", label: "Left to right",  icon: <ArrowRight className="h-3.5 w-3.5" /> },
    { dir: "RL", label: "Right to left",  icon: <ArrowLeft  className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      role="menu"
      aria-label="Organize layout direction"
      className="absolute bottom-full left-0 mb-2 flex flex-col gap-0.5 rounded-xl p-1"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-canvas-panel)",
        minWidth: 168,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.dir}
          role="menuitem"
          onPointerDown={(e) => {
            e.stopPropagation();
            onPick(item.dir);
          }}
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-elevated focus:bg-elevated focus:outline-none"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="flex h-5 w-5 items-center justify-center" style={{ color: "var(--text-primary)" }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOrganize,
}: CanvasControlsProps) {
  const [organizeOpen, setOrganizeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!organizeOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOrganizeOpen(false);
    };
    const handlePointer = (e: PointerEvent) => {
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) setOrganizeOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("pointerdown", handlePointer, true);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handlePointer, true);
    };
  }, [organizeOpen]);

  return (
    <div
      ref={containerRef}
      className="canvas-panel absolute bottom-4 left-4 z-10 flex items-center gap-0.5 rounded-2xl px-1.5 py-1"
      style={{
        color: "var(--text-secondary)",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ControlButton onClick={onZoomOut} label="Zoom out">
        <Minus className="h-4 w-4" />
      </ControlButton>
      <ControlButton onClick={onFitView} label="Fit view">
        <Scan className="h-4 w-4" />
      </ControlButton>
      <ControlButton onClick={onZoomIn} label="Zoom in">
        <Plus className="h-4 w-4" />
      </ControlButton>

      <div
        className="mx-1 h-4 w-px flex-shrink-0"
        style={{ background: "var(--border-subtle)" }}
      />

      <ControlButton onClick={onUndo} disabled={!canUndo} label="Undo">
        <Undo2 className="h-4 w-4" />
      </ControlButton>
      <ControlButton onClick={onRedo} disabled={!canRedo} label="Redo">
        <Redo2 className="h-4 w-4" />
      </ControlButton>

      <div
        className="mx-1 h-4 w-px flex-shrink-0"
        style={{ background: "var(--border-subtle)" }}
      />

      <div className="relative">
        <ControlButton
          onClick={() => setOrganizeOpen((o) => !o)}
          label="Organize layout"
          active={organizeOpen}
        >
          <LayoutGrid className="h-4 w-4" />
        </ControlButton>
        {organizeOpen && (
          <OrganizePopover
            onPick={(dir) => {
              setOrganizeOpen(false);
              onOrganize(dir);
            }}
          />
        )}
      </div>
    </div>
  );
}
