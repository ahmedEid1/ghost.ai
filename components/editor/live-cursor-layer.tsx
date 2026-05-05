"use client";

import { useViewport } from "@xyflow/react";

export interface CursorParticipant {
  id: string;
  displayName: string;
  cursorColor: string;
  cursor: { x: number; y: number } | null;
  thinking: boolean;
}

interface SingleCursorProps {
  participant: CursorParticipant;
  zoom: number;
  vpX: number;
  vpY: number;
}

function ThinkingSpinner({ color }: { color: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4, flexShrink: 0 }}
      aria-hidden
    >
      <circle
        cx="5"
        cy="5"
        r="3.5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="11 5"
        strokeLinecap="round"
        style={{ transformOrigin: "50% 50%", animation: "cursor-spin 0.75s linear infinite" }}
      />
    </svg>
  );
}

function SingleCursor({ participant, zoom, vpX, vpY }: SingleCursorProps) {
  const { cursor, cursorColor, displayName, thinking } = participant;
  if (!cursor) return null;

  const screenX = cursor.x * zoom + vpX;
  const screenY = cursor.y * zoom + vpY;

  return (
    <div
      className="absolute"
      style={{
        left: screenX,
        top: screenY,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 5,
        transform: "translate(0, 0)",
      }}
      aria-hidden
    >
      {/* Pointer glyph */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path
          d="M0 0L0 14L4 10.5L6.5 16L8.5 15L6 9.5H11L0 0Z"
          fill={cursorColor}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.75"
        />
      </svg>

      {/* Name badge — stable min-width so it doesn't jitter during presence updates */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          display: "flex",
          alignItems: "center",
          minWidth: 60,
          padding: "2px 8px",
          borderRadius: 6,
          background: cursorColor,
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          lineHeight: "20px",
          whiteSpace: "nowrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        {thinking && <ThinkingSpinner color="rgba(255,255,255,0.85)" />}
        {displayName}
      </div>
    </div>
  );
}

interface LiveCursorLayerProps {
  participants: CursorParticipant[];
}

// Must be rendered as a child inside the ReactFlow tree to access useViewport.
export function LiveCursorLayer({ participants }: LiveCursorLayerProps) {
  const { x: vpX, y: vpY, zoom } = useViewport();

  const withCursor = participants.filter((p) => p.cursor !== null);
  if (withCursor.length === 0) return null;

  return (
    <>
      <style>{`@keyframes cursor-spin { to { transform: rotate(360deg); } }`}</style>
      {withCursor.map((p) => (
        <SingleCursor
          key={p.id}
          participant={p}
          zoom={zoom}
          vpX={vpX}
          vpY={vpY}
        />
      ))}
    </>
  );
}
