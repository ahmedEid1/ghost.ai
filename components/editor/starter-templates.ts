import type { Node, Edge } from "@xyflow/react";
import { NODE_COLORS, type CanvasNodeData } from "@/types/canvas";
import type { CanvasEdgeData } from "@/components/editor/canvas-edge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CanvasTemplateNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasTemplateEdge = Edge<CanvasEdgeData, "canvasEdge">;

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasTemplateNode[];
  edges: CanvasTemplateEdge[];
}

// ─── Color aliases ────────────────────────────────────────────────────────────

const C_DEFAULT  = NODE_COLORS[0];
const C_BLUE     = NODE_COLORS[1];
const C_PURPLE   = NODE_COLORS[2];
const C_ORANGE   = NODE_COLORS[3];
const C_RED      = NODE_COLORS[4];
const C_PINK     = NODE_COLORS[5];
const C_GREEN    = NODE_COLORS[6];
const C_TEAL     = NODE_COLORS[7];

// ─── Default edge data ────────────────────────────────────────────────────────

function edge(
  id: string,
  source: string,
  target: string,
  label?: string,
  opts?: Partial<CanvasEdgeData & { sourceHandle?: string; targetHandle?: string }>,
): CanvasTemplateEdge {
  const { sourceHandle, targetHandle, ...data } = opts ?? {};
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    sourceHandle: sourceHandle ?? null,
    targetHandle: targetHandle ?? null,
    data: {
      routing: "smoothstep",
      color: "var(--canvas-edge-default)",
      strokeWidth: 1.5,
      strokeDash: "solid",
      arrowStart: false,
      arrowEnd: true,
      label,
      ...data,
    },
  };
}

// ─── Template 1: Microservices Platform ───────────────────────────────────────

const MICROSERVICES_NODES: CanvasTemplateNode[] = [
  {
    id: "ms-client",
    type: "canvasNode",
    position: { x: 0, y: 130 },
    data: { label: "Web Client", shape: "pill", color: C_BLUE },
    width: 140, height: 55,
  },
  {
    id: "ms-api-gateway",
    type: "canvasNode",
    position: { x: 220, y: 110 },
    data: { label: "API Gateway", shape: "hexagon", color: C_TEAL },
    width: 140, height: 90,
  },
  {
    id: "ms-auth-service",
    type: "canvasNode",
    position: { x: 440, y: 20 },
    data: { label: "Auth Service", shape: "rectangle", color: C_PURPLE },
    width: 140, height: 60,
  },
  {
    id: "ms-user-service",
    type: "canvasNode",
    position: { x: 440, y: 130 },
    data: { label: "User Service", shape: "rectangle", color: C_BLUE },
    width: 140, height: 60,
  },
  {
    id: "ms-billing-service",
    type: "canvasNode",
    position: { x: 440, y: 240 },
    data: { label: "Billing Service", shape: "rectangle", color: C_ORANGE },
    width: 140, height: 60,
  },
  {
    id: "ms-cache",
    type: "canvasNode",
    position: { x: 660, y: 10 },
    data: { label: "Cache", shape: "circle", color: C_GREEN },
    width: 80, height: 80,
  },
  {
    id: "ms-user-db",
    type: "canvasNode",
    position: { x: 660, y: 120 },
    data: { label: "User DB", shape: "cylinder", color: C_TEAL },
    width: 100, height: 80,
  },
  {
    id: "ms-message-queue",
    type: "canvasNode",
    position: { x: 660, y: 245 },
    data: { label: "Message Queue", shape: "pill", color: C_ORANGE },
    width: 140, height: 50,
  },
  {
    id: "ms-monitoring",
    type: "canvasNode",
    position: { x: 860, y: 0 },
    data: { label: "Monitoring", shape: "diamond", color: C_DEFAULT },
    width: 110, height: 110,
  },
  {
    id: "ms-notifications",
    type: "canvasNode",
    position: { x: 860, y: 235 },
    data: { label: "Notifications", shape: "rectangle", color: C_PINK },
    width: 140, height: 60,
  },
];

const MICROSERVICES_EDGES: CanvasTemplateEdge[] = [
  edge("ms-e1", "ms-client",          "ms-api-gateway",     "HTTP"),
  edge("ms-e2", "ms-api-gateway",     "ms-auth-service",    undefined, { sourceHandle: "top" }),
  edge("ms-e3", "ms-api-gateway",     "ms-user-service"),
  edge("ms-e4", "ms-api-gateway",     "ms-billing-service", undefined, { sourceHandle: "bottom" }),
  edge("ms-e5", "ms-user-service",    "ms-cache",           "Read"),
  edge("ms-e6", "ms-user-service",    "ms-user-db",         "Persist"),
  edge("ms-e7", "ms-billing-service", "ms-message-queue",   "Publish"),
  edge("ms-e8", "ms-message-queue",   "ms-notifications",   "Consume"),
  edge("ms-e9", "ms-api-gateway",     "ms-monitoring",      "Metrics",
    { strokeDash: "dashed", arrowEnd: false }),
];

// ─── Template 2: CI/CD Pipeline ───────────────────────────────────────────────

const CICD_NODES: CanvasTemplateNode[] = [
  {
    id: "cicd-developer",
    type: "canvasNode",
    position: { x: 0, y: 60 },
    data: { label: "Developer", shape: "circle", color: C_BLUE },
    width: 80, height: 80,
  },
  {
    id: "cicd-repo",
    type: "canvasNode",
    position: { x: 150, y: 55 },
    data: { label: "Git Repository", shape: "cylinder", color: C_DEFAULT },
    width: 110, height: 80,
  },
  {
    id: "cicd-ci-runner",
    type: "canvasNode",
    position: { x: 340, y: 55 },
    data: { label: "CI Runner", shape: "hexagon", color: C_TEAL },
    width: 120, height: 80,
  },
  {
    id: "cicd-tests",
    type: "canvasNode",
    position: { x: 540, y: 70 },
    data: { label: "Test Suite", shape: "rectangle", color: C_GREEN },
    width: 120, height: 55,
  },
  {
    id: "cicd-build",
    type: "canvasNode",
    position: { x: 730, y: 70 },
    data: { label: "Build & Package", shape: "rectangle", color: C_ORANGE },
    width: 130, height: 55,
  },
  {
    id: "cicd-registry",
    type: "canvasNode",
    position: { x: 930, y: 55 },
    data: { label: "Container Registry", shape: "cylinder", color: C_PURPLE },
    width: 120, height: 80,
  },
  {
    id: "cicd-deploy",
    type: "canvasNode",
    position: { x: 1130, y: 55 },
    data: { label: "Deploy Stage", shape: "hexagon", color: C_BLUE },
    width: 120, height: 80,
  },
  {
    id: "cicd-production",
    type: "canvasNode",
    position: { x: 1330, y: 10 },
    data: { label: "Production", shape: "rectangle", color: C_GREEN },
    width: 130, height: 55,
  },
  {
    id: "cicd-monitoring",
    type: "canvasNode",
    position: { x: 1330, y: 110 },
    data: { label: "Monitoring", shape: "diamond", color: C_DEFAULT },
    width: 110, height: 110,
  },
];

const CICD_EDGES: CanvasTemplateEdge[] = [
  edge("cicd-e1", "cicd-developer",  "cicd-repo",        "git push"),
  edge("cicd-e2", "cicd-repo",       "cicd-ci-runner",   "Webhook"),
  edge("cicd-e3", "cicd-ci-runner",  "cicd-tests",       "Run tests"),
  edge("cicd-e4", "cicd-tests",      "cicd-build",       "✓ Pass"),
  edge("cicd-e5", "cicd-build",      "cicd-registry",    "Push image"),
  edge("cicd-e6", "cicd-registry",   "cicd-deploy",      "Pull image"),
  edge("cicd-e7", "cicd-deploy",     "cicd-production",  "Deploy",   { sourceHandle: "top" }),
  edge("cicd-e8", "cicd-deploy",     "cicd-monitoring",  "Metrics",  { sourceHandle: "bottom", strokeDash: "dashed" }),
  edge("cicd-e9", "cicd-monitoring", "cicd-deploy",      "Rollback",
    { strokeDash: "dashed", color: "rgba(255,97,102,0.7)", arrowEnd: true }),
];

// ─── Template 3: Event-Driven System ──────────────────────────────────────────

const EVENT_DRIVEN_NODES: CanvasTemplateNode[] = [
  {
    id: "eds-producer",
    type: "canvasNode",
    position: { x: 0, y: 105 },
    data: { label: "Event Producer", shape: "circle", color: C_BLUE },
    width: 90, height: 90,
  },
  {
    id: "eds-ingestion-api",
    type: "canvasNode",
    position: { x: 170, y: 120 },
    data: { label: "Ingestion API", shape: "rectangle", color: C_BLUE },
    width: 130, height: 60,
  },
  {
    id: "eds-event-bus",
    type: "canvasNode",
    position: { x: 385, y: 100 },
    data: { label: "Event Bus", shape: "hexagon", color: C_TEAL },
    width: 140, height: 100,
  },
  {
    id: "eds-dlq",
    type: "canvasNode",
    position: { x: 385, y: 265 },
    data: { label: "Dead-letter Queue", shape: "pill", color: C_RED },
    width: 150, height: 50,
  },
  {
    id: "eds-order-worker",
    type: "canvasNode",
    position: { x: 610, y: 20 },
    data: { label: "Order Worker", shape: "rectangle", color: C_GREEN },
    width: 130, height: 55,
  },
  {
    id: "eds-analytics-worker",
    type: "canvasNode",
    position: { x: 610, y: 120 },
    data: { label: "Analytics Worker", shape: "rectangle", color: C_ORANGE },
    width: 130, height: 55,
  },
  {
    id: "eds-notification-worker",
    type: "canvasNode",
    position: { x: 610, y: 220 },
    data: { label: "Notification Worker", shape: "rectangle", color: C_PINK },
    width: 140, height: 55,
  },
  {
    id: "eds-read-model",
    type: "canvasNode",
    position: { x: 820, y: 10 },
    data: { label: "Read Model DB", shape: "cylinder", color: C_PURPLE },
    width: 120, height: 80,
  },
  {
    id: "eds-data-warehouse",
    type: "canvasNode",
    position: { x: 820, y: 110 },
    data: { label: "Data Warehouse", shape: "cylinder", color: C_ORANGE },
    width: 120, height: 80,
  },
  {
    id: "eds-notification-svc",
    type: "canvasNode",
    position: { x: 820, y: 215 },
    data: { label: "Notification Svc", shape: "rectangle", color: C_PINK },
    width: 130, height: 55,
  },
];

const EVENT_DRIVEN_EDGES: CanvasTemplateEdge[] = [
  edge("eds-e1",  "eds-producer",             "eds-ingestion-api",      "Events"),
  edge("eds-e2",  "eds-ingestion-api",         "eds-event-bus",          "Publish"),
  edge("eds-e3",  "eds-event-bus",             "eds-order-worker",       "Order events",   { sourceHandle: "top" }),
  edge("eds-e4",  "eds-event-bus",             "eds-analytics-worker",   "Analytics events"),
  edge("eds-e5",  "eds-event-bus",             "eds-notification-worker","Notify events",  { sourceHandle: "bottom" }),
  edge("eds-e6",  "eds-event-bus",             "eds-dlq",                "Failed events",
    { strokeDash: "dashed", color: "rgba(255,97,102,0.7)" }),
  edge("eds-e7",  "eds-order-worker",          "eds-read-model",         "Write"),
  edge("eds-e8",  "eds-analytics-worker",      "eds-data-warehouse",     "Write"),
  edge("eds-e9",  "eds-notification-worker",   "eds-notification-svc",   "Send"),
];

// ─── Template registry ────────────────────────────────────────────────────────

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices-platform",
    name: "Microservices Platform",
    description:
      "A product backend with an API gateway, core services, databases, a message queue, and observability.",
    nodes: MICROSERVICES_NODES,
    edges: MICROSERVICES_EDGES,
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Code moving from a developer through source control, CI, build, artifact storage, deploy, and monitoring.",
    nodes: CICD_NODES,
    edges: CICD_EDGES,
  },
  {
    id: "event-driven-system",
    name: "Event-Driven System",
    description:
      "Producers emitting events through a bus to worker consumers, projections, and a dead-letter queue.",
    nodes: EVENT_DRIVEN_NODES,
    edges: EVENT_DRIVEN_EDGES,
  },
];
