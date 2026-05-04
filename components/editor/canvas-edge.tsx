"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  getBezierPath,
  getStraightPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";

// ─── Data model ───────────────────────────────────────────────────────────────

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
  routing?: "smoothstep" | "bezier" | "straight";
  color?: string;
  strokeWidth?: number;
  strokeDash?: "solid" | "dashed" | "dotted";
  arrowStart?: boolean;
  arrowEnd?: boolean;
  // Smooth-step bend point — undefined means auto-routed
  centerX?: number;
  centerY?: number;
  // Label position as a 0–1 fraction of path length (0 = source end, 1 = target end)
  labelT?: number;
}

export type CanvasEdgeFlowType = Edge<CanvasEdgeData, "canvasEdge">;

// ─── Palette ──────────────────────────────────────────────────────────────────

export const EDGE_COLORS: { label: string; value: string }[] = [
  { label: "Default", value: "rgba(255,255,255,0.55)" },
  { label: "Cyan",    value: "#00c8d4" },
  { label: "Blue",    value: "#52A8FF" },
  { label: "Purple",  value: "#BF7AF0" },
  { label: "Orange",  value: "#FF990A" },
  { label: "Red",     value: "#FF6166" },
  { label: "Pink",    value: "#F75F8F" },
  { label: "Green",   value: "#62C073" },
  { label: "Teal",    value: "#0AC7B4" },
];

export const EDGE_WIDTHS: { label: string; value: number }[] = [
  { label: "Thin",   value: 1.5 },
  { label: "Medium", value: 2.5 },
  { label: "Thick",  value: 4   },
];

// ─── Path helpers ─────────────────────────────────────────────────────────────

type PathParams = Parameters<typeof getSmoothStepPath>[0];

function computePath(
  routing: CanvasEdgeData["routing"],
  params: PathParams,
  centerX?: number,
  centerY?: number,
): [string, number, number] {
  const { sourceX, sourceY, targetX, targetY } = params;

  if (routing === "straight") {
    if (centerX !== undefined && centerY !== undefined) {
      // Two straight segments meeting at the drag point
      const p = `M${sourceX},${sourceY} L${centerX},${centerY} L${targetX},${targetY}`;
      return [p, centerX, centerY];
    }
    const [p, lx, ly] = getStraightPath(params);
    return [p, lx, ly];
  }

  if (routing === "bezier") {
    if (centerX !== undefined && centerY !== undefined) {
      // Quadratic bezier whose midpoint (t=0.5) lands exactly on (centerX, centerY).
      // Solved from: midpoint = (source + 2·ctrl + target) / 4  →  ctrl = 2·center - (source+target)/2
      const qcx = 2 * centerX - (sourceX + targetX) / 2;
      const qcy = 2 * centerY - (sourceY + targetY) / 2;
      const p = `M${sourceX},${sourceY} Q${qcx},${qcy} ${targetX},${targetY}`;
      return [p, centerX, centerY];
    }
    const [p, lx, ly] = getBezierPath(params);
    return [p, lx, ly];
  }

  // smoothstep (default)
  // getSmoothStepPath ignores centerX/centerY when handles are same-side, so
  // build the path manually when a custom center exists — same pattern as
  // straight/bezier above.
  if (centerX !== undefined && centerY !== undefined) {
    // 5-segment orthogonal path: H to centerX, V through centerY, H to target.
    // The drag point (centerX, centerY) is the middle corner of the Z-shape.
    const p = [
      `M${sourceX},${sourceY}`,
      `L${centerX},${sourceY}`,
      `L${centerX},${centerY}`,
      `L${targetX},${centerY}`,
      `L${targetX},${targetY}`,
    ].join(" ");
    return [p, centerX, centerY];
  }
  const [p, lx, ly] = getSmoothStepPath({ ...params, borderRadius: 8 });
  return [p, lx, ly];
}

function dashArray(dash: CanvasEdgeData["strokeDash"], w: number): string | undefined {
  if (dash === "dashed") return `${w * 3.5},${w * 2.5}`;
  if (dash === "dotted")  return `${w * 0.8},${w * 2.5}`;
  return undefined;
}

/**
 * Sample `path` at SAMPLES points and return the t ∈ [0.04, 0.96] closest
 * to (targetX, targetY) in flow coordinates.
 */
function findNearestT(
  pathEl: SVGPathElement,
  targetX: number,
  targetY: number,
  totalLen: number,
): number {
  const SAMPLES = 200;
  let best = 0.5;
  let bestDist = Infinity;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const pt = pathEl.getPointAtLength(totalLen * t);
    const d = (pt.x - targetX) ** 2 + (pt.y - targetY) ** 2;
    if (d < bestDist) { bestDist = d; best = t; }
  }
  // Keep label away from the very endpoints so it never overlaps node handles
  return Math.max(0.04, Math.min(0.96, best));
}

// ─── Main edge component ──────────────────────────────────────────────────────

export function CanvasEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdgeFlowType>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { setEdges, screenToFlowPosition } = useReactFlow();

  const routing     = data?.routing     ?? "smoothstep";
  const color       = data?.color       ?? "rgba(255,255,255,0.55)";
  const strokeWidth = data?.strokeWidth ?? 1.5;
  const strokeDash  = data?.strokeDash  ?? "solid";
  const arrowStart  = data?.arrowStart  ?? false;
  const arrowEnd    = data?.arrowEnd    ?? true;
  const centerX     = data?.centerX;
  const centerY     = data?.centerY;
  const labelT      = data?.labelT      ?? 0.5;

  const pathParams: PathParams = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };
  const [edgePath, midX, midY] = computePath(routing, pathParams, centerX, centerY);

  // The midpoint handle sits at the bend point (centerX/Y when custom, midpoint otherwise)
  const handleX = centerX !== undefined ? centerX : midX;
  const handleY = centerY !== undefined ? centerY : midY;

  // Label position along the path — computed from the live SVG element
  const visiblePathRef = useRef<SVGPathElement>(null);
  const [labelPos, setLabelPos] = useState({ x: midX, y: midY });
  // Local drag pos for smooth feedback before committing labelT
  const [dragLabelPos, setDragLabelPos] = useState<{ x: number; y: number } | null>(null);

  // Recompute label position whenever the path or labelT changes
  useLayoutEffect(() => {
    const el = visiblePathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    if (len === 0) return;
    const pt = el.getPointAtLength(len * labelT);
    setLabelPos({ x: pt.x, y: pt.y });
  }, [edgePath, labelT]);

  const displayLabel = dragLabelPos ?? labelPos;

  const strokeColor = selected ? "#00c8d4" : color;
  const opacity     = selected ? 1 : isHovered ? 1 : 0.65;
  const da          = dashArray(strokeDash, strokeWidth);

  const markerEndId   = `ce-end-${id}`;
  const markerStartId = `ce-start-${id}`;

  const updateEdge = useCallback(
    (patch: Partial<CanvasEdgeData>) => {
      setEdges((edges) =>
        edges.map((e) => e.id === id ? { ...e, data: { ...e.data, ...patch } } : e)
      );
    },
    [id, setEdges],
  );

  const enterEdit = useCallback((e: React.UIEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  // Label drag: project mouse onto the path to find the new labelT
  const handleLabelDragMove = useCallback((flowX: number, flowY: number) => {
    const el = visiblePathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    if (len === 0) return;
    const t = findNearestT(el, flowX, flowY, len);
    const pt = el.getPointAtLength(len * t);
    setDragLabelPos({ x: pt.x, y: pt.y });
  }, []);

  const handleLabelDragEnd = useCallback((flowX: number, flowY: number) => {
    const el = visiblePathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    if (len === 0) return;
    const t = findNearestT(el, flowX, flowY, len);
    updateEdge({ labelT: t });
    setDragLabelPos(null);
  }, [updateEdge]);

  return (
    <>
      <defs>
        <marker id={markerEndId}   markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,1 L8,5 L0,9 Z" fill={strokeColor} opacity={opacity} />
        </marker>
        <marker id={markerStartId} markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto-start-reverse" markerUnits="strokeWidth">
          <path d="M0,1 L8,5 L0,9 Z" fill={strokeColor} opacity={opacity} />
        </marker>
      </defs>

      {/* Wide invisible hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(20, strokeWidth + 16)}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={enterEdit}
      />

      {/* Visible stroke — ref used for getPointAtLength label positioning */}
      <path
        ref={visiblePathRef}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={da}
        opacity={opacity}
        markerEnd={arrowEnd    ? `url(#${markerEndId})`   : undefined}
        markerStart={arrowStart ? `url(#${markerStartId})` : undefined}
        style={{ transition: "stroke 150ms ease, opacity 150ms ease", pointerEvents: "none" }}
      />

      <EdgeLabelRenderer>
        {/* Style toolbar — floats above the label */}
        {selected && (
          <EdgeStyleToolbar
            routing={routing}
            color={color}
            strokeWidth={strokeWidth}
            strokeDash={strokeDash}
            arrowStart={arrowStart}
            arrowEnd={arrowEnd}
            labelX={displayLabel.x}
            labelY={displayLabel.y}
            onUpdate={updateEdge}
          />
        )}

        {/* Midpoint reshape handle — works for all routing types */}
        {selected && (
          <MidpointHandle
            x={handleX}
            y={handleY}
            hasCustomCenter={centerX !== undefined || centerY !== undefined}
            screenToFlowPosition={screenToFlowPosition}
            onDrag={(fx, fy) => updateEdge({ centerX: fx, centerY: fy })}
            onReset={() => updateEdge({ centerX: undefined, centerY: undefined })}
          />
        )}

        {/* Label — always on the path */}
        <EdgeLabelArea
          x={displayLabel.x}
          y={displayLabel.y}
          label={data?.label}
          isEditing={isEditing}
          isActive={!!(isHovered || selected)}
          isSelected={!!selected}
          isCustomT={labelT !== 0.5}
          screenToFlowPosition={screenToFlowPosition}
          onEnterEdit={enterEdit}
          onSave={(label) => { updateEdge({ label }); setIsEditing(false); }}
          onDiscard={() => setIsEditing(false)}
          onDragMove={handleLabelDragMove}
          onDragEnd={handleLabelDragEnd}
          onReset={() => updateEdge({ labelT: 0.5 })}
        />
      </EdgeLabelRenderer>
    </>
  );
}

// ─── Midpoint drag handle (reshapes smooth-step bend) ─────────────────────────

interface MidpointHandleProps {
  x: number;
  y: number;
  hasCustomCenter: boolean;
  screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
  onDrag:  (flowX: number, flowY: number) => void;
  onReset: () => void;
}

function MidpointHandle({ x, y, hasCustomCenter, screenToFlowPosition, onDrag, onReset }: MidpointHandleProps) {
  const [dragging, setDragging] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Remove any lingering listeners if the component unmounts mid-drag
  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      setDragging(true);

      const onMove = (ev: MouseEvent) => {
        const pos = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
        onDrag(pos.x, pos.y);
      };
      const onUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        cleanupRef.current = null;
      };
      // Store removal logic so unmount can run the same cleanup
      cleanupRef.current = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [screenToFlowPosition, onDrag],
  );

  return (
    <div
      className="nodrag nopan"
      title={hasCustomCenter ? "Double-click to reset" : "Drag to reshape"}
      style={{
        position:  "absolute",
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        pointerEvents: "all",
        cursor:    dragging ? "grabbing" : "grab",
        width:  14,
        height: 14,
        borderRadius: "50%",
        background: hasCustomCenter ? "var(--accent-primary)" : "var(--bg-surface)",
        border: "2px solid var(--accent-primary)",
        boxShadow: dragging
          ? "0 0 0 5px rgba(0,200,212,0.25)"
          : "0 0 0 2px rgba(0,200,212,0.15)",
        transition: "box-shadow 120ms, background 120ms",
        zIndex: 5,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onReset(); }}
    />
  );
}

// ─── Edge style toolbar ────────────────────────────────────────────────────────

interface EdgeStyleToolbarProps {
  routing:     Required<CanvasEdgeData>["routing"];
  color:       string;
  strokeWidth: number;
  strokeDash:  Required<CanvasEdgeData>["strokeDash"];
  arrowStart:  boolean;
  arrowEnd:    boolean;
  labelX:      number;
  labelY:      number;
  onUpdate:    (patch: Partial<CanvasEdgeData>) => void;
}

function EdgeStyleToolbar({
  routing, color, strokeWidth, strokeDash,
  arrowStart, arrowEnd, labelX, labelY, onUpdate,
}: EdgeStyleToolbarProps) {
  return (
    <div
      className="nodrag nopan"
      style={{
        position:  "absolute",
        transform: `translate(-50%, calc(-100% - 14px)) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: "all",
      }}
      onMouseDown={(e)   => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e)       => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div style={{
        background:    "var(--bg-elevated)",
        border:        "1px solid var(--border-subtle)",
        borderRadius:  12,
        padding:       "5px 8px",
        display:       "flex",
        flexDirection: "column",
        gap:           5,
        boxShadow:     "0 8px 32px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.04) inset",
        userSelect:    "none",
        whiteSpace:    "nowrap",
      }}>
        {/* Row 1: Routing + Colors */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {(["smoothstep", "bezier", "straight"] as const).map((r) => (
            <TbBtn
              key={r}
              active={routing === r}
              title={r === "smoothstep" ? "Elbow" : r === "bezier" ? "Curve" : "Straight"}
              onClick={() => onUpdate({
                routing: r,
                ...(r !== "smoothstep" ? { centerX: undefined, centerY: undefined } : {}),
              })}
            >
              <RoutingIcon type={r} />
            </TbBtn>
          ))}
          <TbDivider />
          {EDGE_COLORS.map((c) => (
            <button
              type="button"
              key={c.value}
              title={c.label}
              aria-label={c.label}
              aria-pressed={c.value === color}
              onClick={() => onUpdate({ color: c.value })}
              style={{
                width: 14, height: 14,
                borderRadius: "50%",
                background:   c.value,
                border:       c.value === color ? "2px solid rgba(255,255,255,0.9)" : "2px solid transparent",
                outline:      c.value === color
                  ? `2px solid ${c.value === "rgba(255,255,255,0.55)" ? "rgba(255,255,255,0.4)" : c.value}`
                  : "none",
                outlineOffset: 2,
                cursor:       "pointer",
                padding:      0,
                flexShrink:   0,
                transition:   "transform 100ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
            />
          ))}
        </div>

        {/* Row 2: Weight + Dash + Arrows */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {EDGE_WIDTHS.map(({ label, value: w }) => (
            <TbBtn key={w} active={strokeWidth === w} title={label} onClick={() => onUpdate({ strokeWidth: w })}>
              <WeightIcon px={w} />
            </TbBtn>
          ))}
          <TbDivider />
          {(["solid", "dashed", "dotted"] as const).map((d) => (
            <TbBtn key={d} active={strokeDash === d} title={d.charAt(0).toUpperCase() + d.slice(1)} onClick={() => onUpdate({ strokeDash: d })}>
              <DashIcon style={d} />
            </TbBtn>
          ))}
          <TbDivider />
          <TbBtn active={arrowStart} title={arrowStart ? "Remove source arrow" : "Add source arrow"} onClick={() => onUpdate({ arrowStart: !arrowStart })}>
            <ArrowIcon direction="start" />
          </TbBtn>
          <TbBtn active={arrowEnd} title={arrowEnd ? "Remove target arrow" : "Add target arrow"} onClick={() => onUpdate({ arrowEnd: !arrowEnd })}>
            <ArrowIcon direction="end" />
          </TbBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Toolbar primitives ────────────────────────────────────────────────────────

function TbBtn({ active, title, onClick, children }: {
  active: boolean; title: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: 26, height: 26,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 7, border: "none",
        background: active ? "var(--accent-primary-dim)" : "transparent",
        color:      active ? "var(--accent-primary)" : "var(--text-muted)",
        cursor: "pointer", padding: 0,
        transition: "background 120ms, color 120ms",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function TbDivider() {
  return <div style={{ width: 1, height: 16, background: "var(--border-default)", margin: "0 3px", flexShrink: 0 }} />;
}

// ─── Toolbar icons ─────────────────────────────────────────────────────────────

function RoutingIcon({ type }: { type: "straight" | "bezier" | "smoothstep" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {type === "straight"   && <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
      {type === "bezier"     && <path d="M3,13 C3,3 13,13 13,3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      {type === "smoothstep" && <path d="M3,13 L3,8 L13,8 L13,3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function WeightIcon({ px }: { px: number }) {
  const sw = px <= 1.5 ? 1 : px <= 2.5 ? 2 : 3.5;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

function DashIcon({ style }: { style: "solid" | "dashed" | "dotted" }) {
  const dash = style === "dashed" ? "5,3" : style === "dotted" ? "1.5,3" : undefined;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={dash} />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "start" | "end" }) {
  if (direction === "end") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line x1="2" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9,5 L13,8 L9,11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7,5 L3,8 L7,11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Edge label area ──────────────────────────────────────────────────────────

const DRAG_THRESHOLD = 4; // px in screen space before treating as drag

interface EdgeLabelAreaProps {
  x: number;
  y: number;
  label:    string | undefined;
  isEditing:   boolean;
  isActive:    boolean;
  isSelected:  boolean;
  isCustomT:   boolean;
  screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
  onEnterEdit: (e: React.UIEvent) => void;
  onSave:      (label: string) => void;
  onDiscard:   () => void;
  onDragMove:  (flowX: number, flowY: number) => void;
  onDragEnd:   (flowX: number, flowY: number) => void;
  onReset:     () => void;
}

function EdgeLabelArea({
  x, y, label, isEditing, isActive, isSelected, isCustomT,
  screenToFlowPosition, onEnterEdit, onSave, onDiscard,
  onDragMove, onDragEnd, onReset,
}: EdgeLabelAreaProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || isEditing) return;
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;

      const onMove = (ev: MouseEvent) => {
        if (!moved && (Math.abs(ev.clientX - startX) > DRAG_THRESHOLD || Math.abs(ev.clientY - startY) > DRAG_THRESHOLD)) {
          moved = true;
        }
        if (moved) {
          const pos = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
          onDragMove(pos.x, pos.y);
        }
      };

      const onUp = (ev: MouseEvent) => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        if (moved) {
          const pos = screenToFlowPosition({ x: ev.clientX, y: ev.clientY });
          onDragEnd(pos.x, pos.y);
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [isEditing, screenToFlowPosition, onDragMove, onDragEnd],
  );

  const pos: React.CSSProperties = {
    position:  "absolute",
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    pointerEvents: "all",
  };

  if (isEditing) {
    return (
      <div style={pos} className="nodrag nopan"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <EdgeLabelEditor initialLabel={label ?? ""} onSave={onSave} onDiscard={onDiscard} />
      </div>
    );
  }

  if (label) {
    return (
      <div
        role="button"
        tabIndex={0}
        style={{ ...pos, cursor: isSelected ? "grab" : "default" }}
        className="nodrag nopan"
        onMouseDown={handleMouseDown}
        onDoubleClick={onEnterEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onEnterEdit(e); }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              background: "var(--bg-elevated)",
              color:      "var(--text-primary)",
              border:     "1px solid var(--border-subtle)",
              whiteSpace: "nowrap",
              display:    "block",
              boxShadow:  isSelected ? "0 0 0 1px rgba(0,200,212,0.3)" : undefined,
            }}
          >
            {label}
          </span>
          {/* Reset to midpoint — only shown when label has been moved */}
          {isSelected && isCustomT && (
            <button
              type="button"
              title="Reset label to midpoint"
              aria-label="Reset label to midpoint"
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: 16, height: 16,
                borderRadius: "50%",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, fontSize: 10, lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div
        role="button"
        tabIndex={0}
        style={{ ...pos, cursor: isSelected ? "grab" : "default" }}
        className="nodrag nopan"
        onMouseDown={handleMouseDown}
        onDoubleClick={onEnterEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onEnterEdit(e); }
        }}
      >
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{ color: "var(--text-faint)", background: "rgba(0,0,0,0.4)", display: "block" }}
        >
          + label
        </span>
      </div>
    );
  }

  return null;
}

// ─── Inline label editor ──────────────────────────────────────────────────────

interface EdgeLabelEditorProps {
  initialLabel: string;
  onSave:    (label: string) => void;
  onDiscard: () => void;
}

function EdgeLabelEditor({ initialLabel, onSave, onDiscard }: EdgeLabelEditorProps) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialLabel);
  const isComposing = useRef(false);
  const committed   = useRef(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const commit = useCallback((v: string) => {
    if (committed.current) return;
    committed.current = true;
    onSave(v);
  }, [onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (isComposing.current) return;
    if (e.key === "Escape") {
      e.preventDefault();
      committed.current = true;
      onDiscard();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commit(value);
    }
  }, [value, commit, onDiscard]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => commit(value)}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => { isComposing.current = false; }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      aria-label="Edge label"
      className="nodrag nopan rounded-full border px-2 py-0.5 text-center text-xs font-medium outline-none"
      style={{
        background:  "var(--bg-elevated)",
        color:       "var(--text-primary)",
        borderColor: "var(--accent-primary)",
        minWidth:    "64px",
        width:       `${Math.max(64, value.length * 8 + 28)}px`,
        boxShadow:   "0 0 0 2px var(--accent-primary-dim)",
      }}
      spellCheck={false}
    />
  );
}
