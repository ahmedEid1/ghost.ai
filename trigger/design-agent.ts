import { schemaTask, metadata, retry } from "@trigger.dev/sdk";
import { z } from "zod";
import { generateObject } from "ai";
import { liveblocks } from "@/lib/liveblocks";
import { createAnthropicClient, getAnthropicModel } from "@/lib/ai";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { NODE_COLORS } from "@/types/canvas";
import type { AiStatusEvent } from "@/liveblocks.config";
import type { CanvasEdgeData } from "@/components/editor/canvas-edge";

// ─── Zod schema for the AI plan ───────────────────────────────────────────────

const NodeColorNameSchema = z.enum([
  "Dark", "Blue", "Purple", "Orange", "Red", "Pink", "Green", "Teal",
]);
const NodeShapeSchema = z.enum([
  "rectangle", "diamond", "circle", "pill", "cylinder", "hexagon",
]);

const AgentPlanSchema = z.object({
  summary: z.string().describe("Short explanation of the changes made"),
  actions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("add_node"),
        id: z.string().describe("Stable AI-generated ID, prefixed with 'ai-'"),
        shape: NodeShapeSchema,
        label: z.string(),
        color: NodeColorNameSchema.optional(),
        x: z.number(),
        y: z.number(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
      z.object({
        type: z.literal("move_node"),
        id: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      z.object({
        type: z.literal("resize_node"),
        id: z.string(),
        width: z.number(),
        height: z.number(),
      }),
      z.object({
        type: z.literal("update_node_data"),
        id: z.string(),
        label: z.string().optional(),
        color: NodeColorNameSchema.optional(),
        shape: NodeShapeSchema.optional(),
      }),
      z.object({
        type: z.literal("delete_node"),
        id: z.string(),
      }),
      z.object({
        type: z.literal("add_edge"),
        id: z.string().describe("Stable AI-generated ID, prefixed with 'ai-edge-'"),
        source: z.string(),
        target: z.string(),
        label: z.string().optional(),
      }),
      z.object({
        type: z.literal("delete_edge"),
        id: z.string(),
      }),
      z.object({
        type: z.literal("update_edge_data"),
        id: z.string(),
        label: z.string().optional(),
      }),
    ])
  ),
});

// ─── MutableFlow type (mutateFlow callback is untyped for custom node/edge data) ──

interface MutableFlow {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  getNode: (id: string) => Record<string, unknown> | undefined;
  addNode: (node: Record<string, unknown>) => void;
  updateNode: (id: string, updater: (n: Record<string, unknown>) => Record<string, unknown>) => void;
  updateNodeData: (id: string, updater: (d: Record<string, unknown>) => Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  removeNodes: (ids: string[]) => void;
  addEdge: (edge: Record<string, unknown>) => void;
  updateEdgeData: (id: string, updater: (d: Record<string, unknown>) => Record<string, unknown>) => void;
  removeEdge: (id: string) => void;
  removeEdges: (ids: string[]) => void;
}

// ─── Dimension helpers ────────────────────────────────────────────────────────

const DEFAULT_DIMS: Record<string, { width: number; height: number }> = {
  rectangle: { width: 160, height: 80 },
  pill:      { width: 160, height: 60 },
  circle:    { width: 80,  height: 80 },
  diamond:   { width: 140, height: 140 },
  cylinder:  { width: 100, height: 100 },
  hexagon:   { width: 120, height: 120 },
};

const MIN_DIMS: Record<string, { width: number; height: number }> = {
  rectangle: { width: 120, height: 56 },
  pill:      { width: 120, height: 48 },
  circle:    { width: 72,  height: 72 },
  diamond:   { width: 100, height: 100 },
  cylinder:  { width: 100, height: 80 },
  hexagon:   { width: 110, height: 80 },
};

function resolveColor(name?: string) {
  if (!name) return NODE_COLORS[0];
  return NODE_COLORS.find((c) => c.name === name) ?? NODE_COLORS[0];
}

function resolveNodeDims(shape: string, width?: number, height?: number) {
  const defaults = DEFAULT_DIMS[shape] ?? { width: 160, height: 80 };
  const mins = MIN_DIMS[shape] ?? { width: 72, height: 48 };
  return {
    width:  Math.max(mins.width,  width  ?? defaults.width),
    height: Math.max(mins.height, height ?? defaults.height),
  };
}

// ─── Presence + broadcast helpers ────────────────────────────────────────────

async function broadcast(
  roomId: string,
  event: Omit<AiStatusEvent, "type">,
): Promise<void> {
  try {
    await liveblocks.broadcastEvent(roomId, { type: "AI_STATUS", ...event });
  } catch (err) {
    console.error("[design-agent] broadcastEvent failed", err);
  }
}

async function setAiPresence(
  roomId: string,
  aiId: string,
  thinking: boolean,
  cursor?: { x: number; y: number } | null,
): Promise<void> {
  try {
    await liveblocks.setPresence(roomId, {
      userId: aiId,
      data: { cursor: cursor ?? null, thinking },
      userInfo: {
        displayName: "Ghost AI",
        avatarUrl: "",
        cursorColor: "#00c8d4",
      },
      ttl: thinking ? 30 : 5,
    });
  } catch (err) {
    console.error("[design-agent] setPresence failed", err);
  }
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  existingNodes: Array<{ id: string; label?: string; shape?: string; x: number; y: number }>,
  existingEdges: Array<{ id: string; source: string; target: string }>,
): string {
  const hasCanvas = existingNodes.length > 0;
  const canvasContext = hasCanvas
    ? `Current canvas has ${existingNodes.length} nodes and ${existingEdges.length} edges:
Nodes: ${JSON.stringify(existingNodes)}
Edge IDs: ${existingEdges.map((e) => e.id).join(", ")}`
    : "The canvas is currently empty.";

  return `You are Ghost AI, a system architecture assistant. Generate structured graph operations.

${canvasContext}

Rules:
- Use "ai-" prefixed IDs for new nodes (e.g. "ai-api-gateway"), "ai-edge-" for new edges
- IDs must not collide with existing node/edge IDs listed above
- Preserve existing user-created nodes unless the prompt explicitly asks to replace/remove them
- Place users/clients on left or top, services in middle, data stores on right or bottom, external systems at the boundary
- Leave at least 80px visual spacing between node bounding boxes
- For new graphs, start at x:200 y:80 and space nodes 200-280px apart horizontally, 180-220px vertically
- For additions to an existing graph, place new nodes near the existing graph without overlapping

Shape semantics:
- rectangle: services, APIs, backends (default 160×80)
- cylinder: databases, caches, queues (default 100×100)
- hexagon: external systems, third-party (default 120×120)
- diamond: decision points, load balancers (default 140×140)
- circle: users, clients (default 80×80)
- pill: UI layers, gateways (default 160×60)

Color guidelines: Blue for APIs/services, Green for databases, Teal for messaging, Purple for AI/ML, Orange for queues, Dark for neutral`;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export const designAgent = schemaTask({
  id: "design-agent",
  maxDuration: 300,
  schema: z.object({
    prompt: z.string(),
    roomId: z.string(),
    projectId: z.string(),
    userId: z.string(),
  }),
  run: async (payload, { ctx }) => {
    const { prompt, roomId, projectId } = payload;
    const runId = ctx.run.id;
    const aiId = `ghost-ai:${projectId}`;

    const anthropic = createAnthropicClient();
    const model = getAnthropicModel();

    try {
      // Phase: started
      metadata.set("phase", "started");
      await setAiPresence(roomId, aiId, true);
      await broadcast(roomId, {
        projectId, runId,
        phase: "started",
        message: "Ghost AI is waking up…",
        at: new Date().toISOString(),
      });

      // Phase: reading canvas
      metadata.set("phase", "reading-canvas");
      await broadcast(roomId, {
        projectId, runId,
        phase: "reading-canvas",
        message: "Reading current canvas state…",
        at: new Date().toISOString(),
      });

      type RawNode = {
        id: string;
        position?: { x: number; y: number };
        data?: { label?: string; shape?: string };
      };
      type RawEdge = { id: string; source: string; target: string };

      const currentNodes: RawNode[] = [];
      const currentEdges: RawEdge[] = [];

      // Read-only pass — we need a mutateFlow call to access storage
      await mutateFlow({ client: liveblocks, roomId }, async (rawFlow) => {
        const flow = rawFlow as unknown as MutableFlow;
        for (const n of flow.nodes as RawNode[]) {
          currentNodes.push(n);
        }
        for (const e of flow.edges as RawEdge[]) {
          currentEdges.push(e);
        }
      });

      // Phase: planning
      metadata.set("phase", "planning");
      await broadcast(roomId, {
        projectId, runId,
        phase: "planning",
        message: "Planning with Claude…",
        at: new Date().toISOString(),
      });

      const existingForPrompt = currentNodes.map((n) => ({
        id: n.id,
        label: n.data?.label ?? "",
        shape: n.data?.shape ?? "rectangle",
        x: n.position?.x ?? 0,
        y: n.position?.y ?? 0,
      }));
      const existingEdgesForPrompt = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));

      const { object: plan } = await retry.onThrow(
        async () =>
          generateObject({
            model: anthropic(model),
            schema: AgentPlanSchema,
            system: buildSystemPrompt(existingForPrompt, existingEdgesForPrompt),
            prompt: `User request: ${prompt}\n\nGenerate the minimal, clear set of operations to fulfill this request.`,
          }),
        { maxAttempts: 5, minTimeoutInMs: 10_000, maxTimeoutInMs: 60_000, factor: 2 },
      );

      // Phase: validating
      metadata.set("phase", "validating");
      await broadcast(roomId, {
        projectId, runId,
        phase: "validating",
        message: `Validating ${plan.actions.length} planned operations…`,
        at: new Date().toISOString(),
      });

      // Collect IDs that will exist after all add_node actions
      const existingNodeIds = new Set(currentNodes.map((n) => n.id));
      const existingEdgeIds = new Set(currentEdges.map((e) => e.id));
      const newNodeIds = new Set(
        plan.actions
          .filter((a) => a.type === "add_node")
          .map((a) => a.id),
      );
      const allNodeIds = new Set([...existingNodeIds, ...newNodeIds]);
      const newEdgeIds = new Set<string>();

      const validActions = plan.actions.filter((action) => {
        switch (action.type) {
          case "add_node": {
            if (existingNodeIds.has(action.id)) {
              console.warn(`[design-agent] skip add_node: ID ${action.id} already exists`);
              return false;
            }
            return true;
          }
          case "move_node":
          case "resize_node":
          case "update_node_data": {
            if (!allNodeIds.has(action.id)) {
              console.warn(`[design-agent] skip ${action.type}: unknown node ${action.id}`);
              return false;
            }
            return true;
          }
          case "delete_node":
            return allNodeIds.has(action.id);
          case "add_edge": {
            if (!allNodeIds.has(action.source) || !allNodeIds.has(action.target)) {
              console.warn(`[design-agent] skip add_edge: dangling ref (${action.source} -> ${action.target})`);
              return false;
            }
            if (existingEdgeIds.has(action.id) || newEdgeIds.has(action.id)) {
              console.warn(`[design-agent] skip add_edge: duplicate ID ${action.id}`);
              return false;
            }
            newEdgeIds.add(action.id);
            return true;
          }
          case "delete_edge":
            return existingEdgeIds.has(action.id);
          case "update_edge_data": {
            if (!existingEdgeIds.has(action.id)) {
              console.warn(`[design-agent] skip update_edge_data: unknown edge ${action.id}`);
              return false;
            }
            return true;
          }
          default:
            return false;
        }
      });

      const nodeOpCount = validActions.filter((a) =>
        ["add_node", "move_node", "resize_node", "update_node_data", "delete_node"].includes(a.type),
      ).length;
      const edgeOpCount = validActions.filter((a) =>
        ["add_edge", "delete_edge", "update_edge_data"].includes(a.type),
      ).length;

      // Phase: applying
      metadata.set("phase", "applying");
      await broadcast(roomId, {
        projectId, runId,
        phase: "applying",
        message: `Applying ${nodeOpCount} node and ${edgeOpCount} edge operations…`,
        at: new Date().toISOString(),
      });

      // Move AI cursor to center of new nodes
      const addedNodes = validActions.filter(
        (a): a is { type: "add_node"; x: number; y: number } & typeof a => a.type === "add_node",
      );
      if (addedNodes.length > 0) {
        const cx = addedNodes.reduce((s, n) => s + n.x, 0) / addedNodes.length;
        const cy = addedNodes.reduce((s, n) => s + n.y, 0) / addedNodes.length;
        await setAiPresence(roomId, aiId, true, { x: cx, y: cy });
      }

      // Apply all validated actions via mutateFlow
      await mutateFlow({ client: liveblocks, roomId }, async (rawFlow) => {
        const flow = rawFlow as unknown as MutableFlow;
        for (const action of validActions) {
          switch (action.type) {
            case "add_node": {
              const dims = resolveNodeDims(action.shape, action.width, action.height);
              flow.addNode({
                id: action.id,
                type: "canvasNode",
                position: { x: action.x, y: action.y },
                width: dims.width,
                height: dims.height,
                data: {
                  label: action.label,
                  shape: action.shape,
                  color: resolveColor(action.color),
                },
              });
              break;
            }
            case "move_node": {
              flow.updateNode(action.id, (node) => ({
                ...node,
                position: { x: action.x, y: action.y },
              }));
              break;
            }
            case "resize_node": {
              const existing = flow.getNode(action.id) as { data?: { shape?: string } } | undefined;
              const shape = existing?.data?.shape ?? "rectangle";
              const mins = MIN_DIMS[shape] ?? { width: 72, height: 48 };
              flow.updateNode(action.id, (node) => ({
                ...node,
                width:  Math.max(mins.width,  action.width),
                height: Math.max(mins.height, action.height),
              }));
              break;
            }
            case "update_node_data": {
              flow.updateNodeData(action.id, (data: Record<string, unknown>) => ({
                ...data,
                ...(action.label !== undefined ? { label: action.label } : {}),
                ...(action.color !== undefined ? { color: resolveColor(action.color) } : {}),
                ...(action.shape !== undefined ? { shape: action.shape } : {}),
              }));
              break;
            }
            case "delete_node": {
              // Also remove connected edges
              const connected = (flow.edges as Array<{ id: string; source: string; target: string }>)
                .filter((e) => e.source === action.id || e.target === action.id)
                .map((e) => e.id);
              flow.removeEdges(connected);
              flow.removeNode(action.id);
              break;
            }
            case "add_edge": {
              const defaultData: CanvasEdgeData = {
                routing:     "smoothstep",
                color:       "rgba(255,255,255,0.55)",
                strokeWidth: 1.5,
                strokeDash:  "solid",
                arrowStart:  false,
                arrowEnd:    true,
                ...(action.label ? { label: action.label } : {}),
              };
              flow.addEdge({
                id: action.id,
                type: "canvasEdge",
                source: action.source,
                target: action.target,
                data: defaultData,
              });
              break;
            }
            case "delete_edge": {
              flow.removeEdge(action.id);
              break;
            }
            case "update_edge_data": {
              flow.updateEdgeData(action.id, (data: Record<string, unknown>) => ({
                ...data,
                ...(action.label !== undefined ? { label: action.label } : {}),
              }));
              break;
            }
          }
        }
      });

      // Phase: complete
      metadata.set("phase", "complete");
      metadata.set("summary", plan.summary);
      metadata.set("nodeCount", nodeOpCount);
      metadata.set("edgeCount", edgeOpCount);
      await broadcast(roomId, {
        projectId, runId,
        phase: "complete",
        message: plan.summary,
        nodeCount: nodeOpCount,
        edgeCount: edgeOpCount,
        at: new Date().toISOString(),
      });

      return { summary: plan.summary, nodeCount: nodeOpCount, edgeCount: edgeOpCount };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      metadata.set("phase", "error");
      metadata.set("errorMessage", message);
      await broadcast(roomId, {
        projectId, runId,
        phase: "error",
        message: "Design generation failed. Please try again.",
        at: new Date().toISOString(),
      });
      throw err;
    } finally {
      // Clear AI presence
      await setAiPresence(roomId, aiId, false, null);
    }
  },
});
