"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Handle,
  Position,
  NodeResizer,
  useConnection,
  useReactFlow,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import { type CanvasNodeData, type NodeShape, type NodeColor, NODE_COLORS } from "@/types/canvas";
import { ShapeBody } from "@/components/editor/node-shapes";

export type CanvasNodeType = Node<CanvasNodeData, "canvasNode">;

// --- Per-shape minimum dimensions ---

const SHAPE_MIN: Record<NodeShape, { w: number; h: number }> = {
  rectangle: { w: 120, h: 56  },
  pill:      { w: 120, h: 48  },
  circle:    { w: 72,  h: 72  },
  diamond:   { w: 100, h: 100 },
  cylinder:  { w: 100, h: 80  },
  hexagon:   { w: 110, h: 80  },
};

const GLOBAL_MIN_W = 72;
const GLOBAL_MIN_H = 48;

const HANDLE_BASE: React.CSSProperties = {
  background: "var(--text-primary)",
  border: "none",
  width: 8,
  height: 8,
  borderRadius: "50%",
  transition: "opacity 150ms ease",
};

// --- Color toolbar ---

interface NodeColorToolbarProps {
  id: string;
  currentColor: NodeColor;
  updateNodeData: ReturnType<typeof useReactFlow>["updateNodeData"];
}

function NodeColorToolbar({ id, currentColor, updateNodeData }: NodeColorToolbarProps) {
  return (
    <div
      className="nodrag nopan pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-lg px-2 py-1.5"
      style={{
        bottom: "calc(100% + 10px)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((color, i) => {
        const isActive = color.fill === currentColor.fill && color.text === currentColor.text;
        return (
          <button
            key={i}
            aria-label={color.name}
            aria-pressed={isActive}
            className="nodrag nopan h-5 w-5 rounded-full transition-transform hover:scale-110"
            style={{
              background: color.fill,
              outline: isActive ? `2px solid ${color.text}` : "2px solid transparent",
              outlineOffset: "2px",
              boxShadow: isActive ? `0 0 5px 1px ${color.text}50` : undefined,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 5px 1px ${color.text}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              updateNodeData(id, { color });
            }}
          />
        );
      })}
    </div>
  );
}

// --- Canvas node ---

export function CanvasNode({ id, data, selected }: NodeProps<CanvasNodeType>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const connection = useConnection();
  const { updateNodeData } = useReactFlow();

  // Stores the label value when the edit session started — used to roll back on Escape.
  const sessionOriginalLabel = useRef<string>("");

  const active = isHovered || !!selected || connection.inProgress;
  const handleStyle: React.CSSProperties = { ...HANDLE_BASE, opacity: active ? 1 : 0 };

  const borderColor = selected
    ? "var(--accent-primary)"
    : isHovered
      ? "var(--border-subtle)"
      : "var(--border-default)";

  const shapeMin = SHAPE_MIN[data.shape];
  const minWidth  = Math.max(shapeMin.w, GLOBAL_MIN_W);
  const minHeight = Math.max(shapeMin.h, GLOBAL_MIN_H);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      sessionOriginalLabel.current = data.label;
      setIsEditing(true);
    },
    [data.label],
  );

  const commitEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const cancelEdit = useCallback(() => {
    updateNodeData(id, { label: sessionOriginalLabel.current });
    setIsEditing(false);
  }, [id, updateNodeData]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={isEditing ? undefined : handleDoubleClick}
      className="relative h-full w-full select-none"
      style={{ color: data.color.text }}
    >
      {/* Resize affordances — only visible when selected */}
      <NodeResizer
        isVisible={!!selected}
        minWidth={minWidth}
        minHeight={minHeight}
        handleStyle={{
          width: 9,
          height: 9,
          borderRadius: 3,
          background: "var(--accent-primary)",
          border: "1.5px solid var(--bg-base)",
          opacity: 0.85,
        }}
        lineStyle={{
          borderColor: "var(--accent-primary)",
          opacity: 0.35,
          borderWidth: 1,
          borderStyle: "dashed",
        }}
      />

      {/* Connection handles */}
      <Handle id="top"    type="source" position={Position.Top}    style={handleStyle} />
      <Handle id="left"   type="source" position={Position.Left}   style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
      <Handle id="right"  type="source" position={Position.Right}  style={handleStyle} />

      {/* Color toolbar — floats above the node when selected */}
      {selected && (
        <NodeColorToolbar id={id} currentColor={data.color} updateNodeData={updateNodeData} />
      )}

      {/* Shape visual */}
      <ShapeBody shape={data.shape} fill={data.color.fill} borderColor={borderColor} />

      {/* Label / editing layer */}
      {isEditing ? (
        <EditingOverlay
          id={id}
          label={data.label}
          textColor={data.color.text}
          onCommit={commitEdit}
          onCancel={cancelEdit}
          updateNodeData={updateNodeData}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden px-3 py-2">
          {data.label ? (
            <span
              className="max-w-full overflow-hidden text-center text-sm font-medium leading-tight"
              style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
            >
              {data.label}
            </span>
          ) : (
            <span
              className="text-center text-sm font-medium leading-tight"
              style={{ opacity: 0.3 }}
            >
              Label
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// --- Inline editing overlay ---

interface EditingOverlayProps {
  id: string;
  label: string;
  textColor: string;
  onCommit: () => void;
  onCancel: () => void;
  updateNodeData: ReturnType<typeof useReactFlow>["updateNodeData"];
}

function EditingOverlay({ id, label, textColor, onCommit, onCancel, updateNodeData }: EditingOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(label);
  const isComposing = useRef(false);

  // Auto-focus + select all on mount
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.select();
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      setValue(next);
      // Real-time collaborative sync on every keystroke
      updateNodeData(id, { label: next });
      // Auto-grow textarea height
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    [id, updateNodeData],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Absorb all keyboard events so canvas shortcuts never fire during editing
      e.stopPropagation();

      if (isComposing.current) return; // let IME resolve before acting

      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onCommit();
        return;
      }
    },
    [onCommit, onCancel],
  );

  return (
    <div
      className="nodrag nopan pointer-events-auto absolute inset-0 flex items-center justify-center px-3 py-2"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="nodrag nopan w-full resize-none bg-transparent text-center text-sm font-medium leading-tight outline-none"
        style={{
          color: textColor,
          caretColor: textColor,
          overflow: "hidden",
          minHeight: "1em",
        }}
        rows={1}
        spellCheck={false}
      />
    </div>
  );
}
