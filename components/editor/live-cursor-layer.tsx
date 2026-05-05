"use client";

import { useViewport } from "@xyflow/react";

export interface CursorParticipant {
  id: string;
  displayName: string;
  cursorColor: string;
  cursor: { x: number; y: number } | null;
}

interface SingleCursorProps {
  participant: CursorParticipant;
  zoom: number;
  vpX: number;
  vpY: number;
}

function SingleCursor({ participant, zoom, vpX, vpY }: SingleCursorProps) {
  const { cursor, cursorColor, displayName } = participant;
  if (!cursor) return null;

  // Convert flow coordinates to container-relative pixel position
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

      {/* Name badge */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
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
