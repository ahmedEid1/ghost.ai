"use client";

import { type NodeShape } from "@/types/canvas";

interface ShapeBodyProps {
  shape: NodeShape;
  fill: string;
  borderColor: string;
}

export function ShapeBody({ shape, fill, borderColor }: ShapeBodyProps) {
  switch (shape) {
    case "rectangle":
      return (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl border-2"
          style={{
            background: fill,
            borderColor,
            transition: "border-color 150ms ease",
          }}
        />
      );

    case "pill":
      return (
        <div
          className="pointer-events-none absolute inset-0 rounded-full border-2"
          style={{
            background: fill,
            borderColor,
            transition: "border-color 150ms ease",
          }}
        />
      );

    case "circle":
      return (
        <div
          className="pointer-events-none absolute inset-0 rounded-full border-2"
          style={{
            background: fill,
            borderColor,
            transition: "border-color 150ms ease",
          }}
        />
      );

    case "diamond":
      return (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          overflow="visible"
        >
          <polygon
            points="50,11 89,50 50,89 11,50"
            style={{
              fill,
              stroke: borderColor,
              strokeWidth: 3,
              transition: "stroke 150ms ease, fill 150ms ease",
            }}
          />
        </svg>
      );

    case "hexagon":
      return (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          overflow="visible"
        >
          <polygon
            points="50,11 86,30 86,70 50,89 14,70 14,30"
            style={{
              fill,
              stroke: borderColor,
              strokeWidth: 3,
              transition: "stroke 150ms ease, fill 150ms ease",
            }}
          />
        </svg>
      );

    case "cylinder":
      return (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Body fill */}
          <rect x="3" y="16" width="94" height="68" style={{ fill }} />
          {/* Bottom ellipse (drawn before sides so sides appear on top) */}
          <ellipse
            cx="50"
            cy="84"
            rx="47"
            ry="13"
            style={{
              fill,
              stroke: borderColor,
              strokeWidth: 2.5,
              transition: "stroke 150ms ease, fill 150ms ease",
            }}
          />
          {/* Left and right edges */}
          <line
            x1="3" y1="16" x2="3" y2="84"
            style={{ stroke: borderColor, strokeWidth: 2.5, transition: "stroke 150ms ease" }}
          />
          <line
            x1="97" y1="16" x2="97" y2="84"
            style={{ stroke: borderColor, strokeWidth: 2.5, transition: "stroke 150ms ease" }}
          />
          {/* Top ellipse (drawn last to cap the body) */}
          <ellipse
            cx="50"
            cy="16"
            rx="47"
            ry="13"
            style={{
              fill,
              stroke: borderColor,
              strokeWidth: 2.5,
              transition: "stroke 150ms ease, fill 150ms ease",
            }}
          />
        </svg>
      );
  }
}
