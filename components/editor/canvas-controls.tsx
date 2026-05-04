"use client";

import { Minus, Scan, Plus, Undo2, Redo2 } from "lucide-react";

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ControlButton({ onClick, disabled, label, children }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40"
      style={{ color: "var(--text-secondary)" }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {children}
    </button>
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
}: CanvasControlsProps) {
  return (
    <div
      className="absolute bottom-4 left-4 z-10 flex items-center gap-0.5 rounded-xl px-1.5 py-1"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
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
    </div>
  );
}
