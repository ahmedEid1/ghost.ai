"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { type NodeShape, NODE_SHAPES } from "@/types/canvas";
import { ShapeBody } from "@/components/editor/node-shapes";

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

export const DRAG_DATA_KEY = "application/ghost-shape";

export const SHAPE_DEFAULT_SIZES: Record<NodeShape, { width: number; height: number }> = {
  rectangle: { width: 160, height: 80 },
  diamond:   { width: 140, height: 140 },
  circle:    { width: 80,  height: 80  },
  pill:      { width: 160, height: 60  },
  cylinder:  { width: 100, height: 100 },
  hexagon:   { width: 120, height: 120 },
};

const SHAPE_LABELS: Record<NodeShape, string> = {
  rectangle: "Rectangle",
  diamond:   "Diamond",
  circle:    "Circle",
  pill:      "Pill",
  cylinder:  "Cylinder",
  hexagon:   "Hexagon",
};

// --- Drag ghost preview ---

interface GhostInfo {
  shape: NodeShape;
  width: number;
  height: number;
}

interface DragGhostProps {
  info: GhostInfo;
  x: number;
  y: number;
}

function DragGhost({ info, x, y }: DragGhostProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed"
      style={{
        zIndex: 9998,
        left: x + 14,
        top: y + 14,
        width: info.width,
        height: info.height,
        opacity: 0.78,
      }}
    >
      <div className="relative h-full w-full">
        <ShapeBody
          shape={info.shape}
          fill="var(--bg-surface)"
          borderColor="var(--accent-primary)"
        />
      </div>
    </div>,
    document.body,
  );
}

// --- Shape icon (panel button) ---

function ShapeIcon({ shape }: { shape: NodeShape }) {
  const shared = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" as const };

  switch (shape) {
    case "rectangle":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
          <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "pill":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
          <rect x="2" y="7" width="20" height="10" rx="5" />
        </svg>
      );
    case "cylinder":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
          <ellipse cx="12" cy="6" rx="9" ry="3" />
          <path d="M3 6v12" strokeLinecap="round" />
          <path d="M21 6v12" strokeLinecap="round" />
          <ellipse cx="12" cy="18" rx="9" ry="3" />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" {...shared}>
          <path d="M12 2 L21.2 7 L21.2 17 L12 22 L2.8 17 L2.8 7 Z" />
        </svg>
      );
  }
}

// --- Shape button ---

interface ShapeButtonProps {
  shape: NodeShape;
  onDragStart: (shape: NodeShape, width: number, height: number) => void;
  onDragEnd: () => void;
}

function ShapeButton({ shape, onDragStart, onDragEnd }: ShapeButtonProps) {
  function handleDragStart(e: React.DragEvent) {
    const { width, height } = SHAPE_DEFAULT_SIZES[shape];
    const payload: ShapeDragPayload = { shape, width, height };
    e.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";

    // Suppress the browser's native ghost image
    const blank = document.createElement("div");
    blank.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;";
    document.body.appendChild(blank);
    e.dataTransfer.setDragImage(blank, 0, 0);
    setTimeout(() => document.body.removeChild(blank), 0);

    onDragStart(shape, width, height);
  }

  return (
    <div className="group relative flex flex-col items-center">
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2 py-1 text-xs opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
      >
        {SHAPE_LABELS[shape]}
      </span>

      {/* Button */}
      <button
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        title={SHAPE_LABELS[shape]}
        className="flex h-9 w-9 cursor-grab items-center justify-center rounded-xl transition-colors active:cursor-grabbing"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-subtle)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
        }}
      >
        <ShapeIcon shape={shape} />
      </button>
    </div>
  );
}

// --- Shape panel ---

export function ShapePanel() {
  const [draggingShape, setDraggingShape] = useState<GhostInfo | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleDragStart = useCallback((shape: NodeShape, width: number, height: number) => {
    setDraggingShape({ shape, width, height });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingShape(null);
  }, []);

  useEffect(() => {
    if (!draggingShape) return;

    const onDragOver = (e: DragEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const onDragEnd = () => setDraggingShape(null);

    // Capture phase so we see all dragover events regardless of child handling
    document.addEventListener("dragover", onDragOver, true);
    document.addEventListener("dragend", onDragEnd, true);
    document.addEventListener("drop", onDragEnd, true);

    return () => {
      document.removeEventListener("dragover", onDragOver, true);
      document.removeEventListener("dragend", onDragEnd, true);
      document.removeEventListener("drop", onDragEnd, true);
    };
  }, [draggingShape]);

  return (
    <>
      {draggingShape && (
        <DragGhost info={draggingShape} x={cursorPos.x} y={cursorPos.y} />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div
          className="pointer-events-auto flex items-center gap-1 rounded-full border px-3 py-2 shadow-2xl"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-default)",
          }}
        >
          {NODE_SHAPES.map((shape) => (
            <ShapeButton
              key={shape}
              shape={shape}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
    </>
  );
}
