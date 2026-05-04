"use client";

import { LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
  type CanvasTemplateNode,
} from "@/components/editor/starter-templates";

// ─── Preview geometry helpers ─────────────────────────────────────────────────

interface Bounds {
  minX: number; minY: number; maxX: number; maxY: number;
}

function getTemplateBounds(nodes: CanvasTemplateNode[]): Bounds {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 200, maxY: 120 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    const w = node.width ?? 140;
    const h = node.height ?? 60;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + w);
    maxY = Math.max(maxY, node.position.y + h);
  }
  return { minX, minY, maxX, maxY };
}

// ─── Canvas-style SVG diagram preview ────────────────────────────────────────

const PW = 340;  // preview width
const PH = 192;  // preview height
const PAD = 18;  // inner padding

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const tid = template.id; // used as a namespace for SVG IDs

  const bounds = getTemplateBounds(template.nodes);
  const bW = bounds.maxX - bounds.minX || 1;
  const bH = bounds.maxY - bounds.minY || 1;

  const scaleX = (PW - PAD * 2) / bW;
  const scaleY = (PH - PAD * 2) / bH;
  const scale  = Math.min(scaleX, scaleY);

  const offsetX = PAD + ((PW - PAD * 2) - bW * scale) / 2;
  const offsetY = PAD + ((PH - PAD * 2) - bH * scale) / 2;

  function project(x: number, y: number) {
    return {
      x: offsetX + (x - bounds.minX) * scale,
      y: offsetY + (y - bounds.minY) * scale,
    };
  }

  function nodeGeom(node: CanvasTemplateNode) {
    const w = (node.width  ?? 140) * scale;
    const h = (node.height ?? 60)  * scale;
    const { x, y } = project(node.position.x, node.position.y);
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }

  // Build a center-point map so edges can reference nodes by ID
  const geomMap: Record<string, ReturnType<typeof nodeGeom>> = {};
  for (const node of template.nodes) {
    geomMap[node.id] = nodeGeom(node);
  }

  // Clamp font size to a readable range given the scale
  const labelSize = Math.max(4.5, Math.min(6.5, scale * 10));

  return (
    <svg
      width={PW}
      height={PH}
      viewBox={`0 0 ${PW} ${PH}`}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        {/* Canvas-style dot grid */}
        <pattern id={`dots-${tid}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="0.85" fill="rgba(240,240,244,0.09)" />
        </pattern>

        {/* Arrowhead marker */}
        <marker
          id={`arrow-${tid}`}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0.5 L0,5.5 L5.5,3 Z" fill="rgba(255,255,255,0.38)" />
        </marker>

        {/* Per-node clip paths */}
        {template.nodes.map((node) => {
          const { x, y, w, h } = geomMap[node.id];
          return (
            <clipPath key={node.id} id={`clip-${tid}-${node.id}`}>
              <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} />
            </clipPath>
          );
        })}
      </defs>

      {/* Background */}
      <rect width={PW} height={PH} style={{ fill: "var(--bg-base)" }} />
      <rect width={PW} height={PH} fill={`url(#dots-${tid})`} />

      {/* Edges — drawn below nodes */}
      {template.edges.map((edg) => {
        const src = geomMap[edg.source];
        const tgt = geomMap[edg.target];
        if (!src || !tgt) return null;

        const isDashed = edg.data?.strokeDash === "dashed" || edg.data?.strokeDash === "dotted";

        return (
          <line
            key={edg.id}
            x1={src.cx}
            y1={src.cy}
            x2={tgt.cx}
            y2={tgt.cy}
            stroke="rgba(255,255,255,0.28)"
            strokeWidth={1}
            strokeDasharray={isDashed ? "3 2.5" : undefined}
            markerEnd={`url(#arrow-${tid})`}
          />
        );
      })}

      {/* Nodes */}
      {template.nodes.map((node) => {
        const { x, y, w, h, cx, cy } = geomMap[node.id];
        const fill   = node.data.color.fill;
        const stroke = node.data.color.text;
        const shape  = node.data.shape;
        const sw     = 0.8;

        let shape_el: React.ReactNode;

        if (shape === "circle") {
          shape_el = (
            <ellipse
              cx={cx} cy={cy}
              rx={w / 2} ry={h / 2}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
          );
        } else if (shape === "diamond") {
          shape_el = (
            <polygon
              points={`${cx},${y} ${x+w},${cy} ${cx},${y+h} ${x},${cy}`}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
          );
        } else if (shape === "hexagon") {
          shape_el = (
            <polygon
              points={[
                `${x + w*0.25},${y}`,
                `${x + w*0.75},${y}`,
                `${x + w},${cy}`,
                `${x + w*0.75},${y + h}`,
                `${x + w*0.25},${y + h}`,
                `${x},${cy}`,
              ].join(" ")}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
          );
        } else if (shape === "pill") {
          shape_el = (
            <rect
              x={x} y={y} width={w} height={h}
              rx={h / 2} ry={h / 2}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
          );
        } else if (shape === "cylinder") {
          const ry = Math.min(h * 0.22, w * 0.18);
          shape_el = (
            <g>
              <rect x={x} y={y+ry} width={w} height={h - ry * 2} fill={fill} stroke="none" />
              <ellipse cx={cx} cy={y + ry}     rx={w/2} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
              <ellipse cx={cx} cy={y + h - ry} rx={w/2} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
              {/* Side borders */}
              <line x1={x} y1={y+ry} x2={x} y2={y+h-ry} stroke={stroke} strokeWidth={sw} />
              <line x1={x+w} y1={y+ry} x2={x+w} y2={y+h-ry} stroke={stroke} strokeWidth={sw} />
            </g>
          );
        } else {
          // rectangle (default)
          shape_el = (
            <rect
              x={x} y={y} width={w} height={h}
              rx={2} ry={2}
              fill={fill} stroke={stroke} strokeWidth={sw}
            />
          );
        }

        return (
          <g key={node.id}>
            {shape_el}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={labelSize}
              fill={stroke}
              opacity={0.9}
              clipPath={`url(#clip-${tid}-${node.id})`}
              style={{ pointerEvents: "none", fontFamily: "system-ui, sans-serif" }}
            >
              {node.data.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-200"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border-default)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,200,212,0.35)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 1px rgba(0,200,212,0.18), 0 8px 24px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Canvas-style diagram preview */}
      <div className="overflow-hidden" style={{ lineHeight: 0 }}>
        <TemplatePreview template={template} />
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "var(--border-default)" }} />

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <h3
            className="text-sm font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {template.name}
          </h3>
          <p
            className="line-clamp-2 text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {template.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {template.nodes.length} nodes · {template.edges.length} edges
          </p>
          <button
            onClick={() => onImport(template)}
            className="w-full rounded-xl py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
            style={{
              background: "var(--accent-primary)",
              color: "var(--bg-base)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 rounded-3xl sm:max-w-[72rem]"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="shrink-0 flex-row items-start gap-4 border-b px-7 py-6"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-primary-dim)" }}
          >
            <LayoutTemplate
              className="h-4.5 w-4.5"
              style={{ color: "var(--accent-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <DialogTitle
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Starter Templates
            </DialogTitle>
            <DialogDescription
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Pick a prebuilt system design to load onto your canvas. This replaces any existing content.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Template grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 gap-5 p-7 sm:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={handleImport}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
