"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { type CanvasNodeData } from "@/types/canvas";

export type CanvasNodeType = Node<CanvasNodeData, "canvasNode">;

const HANDLE_BASE: React.CSSProperties = {
  background: "white",
  border: "none",
  width: 8,
  height: 8,
  borderRadius: "50%",
  transition: "opacity 150ms ease",
};

export function CanvasNode({ data, selected }: NodeProps<CanvasNodeType>) {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpacity = isHovered || selected ? 1 : 0;
  const handleStyle: React.CSSProperties = { ...HANDLE_BASE, opacity: handleOpacity };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: data.color.fill,
        color: data.color.text,
        borderColor: selected
          ? "var(--accent-primary)"
          : isHovered
            ? "var(--border-subtle)"
            : "var(--border-default)",
        minWidth: 80,
        minHeight: 40,
        width: "100%",
        height: "100%",
      }}
      className="relative flex items-center justify-center rounded-xl border-2 px-4 py-2 text-sm font-medium select-none transition-colors"
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />

      <span className="pointer-events-none text-center leading-tight">
        {data.label || data.shape}
      </span>
    </div>
  );
}
