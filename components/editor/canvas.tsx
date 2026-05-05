"use client";

import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useUpdateMyPresence, useEventListener } from "@liveblocks/react";
import type { AiStatusEvent } from "@/liveblocks.config";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  SelectionMode,
  useReactFlow,
  type Node,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

import { CanvasNode } from "@/components/editor/canvas-node";
import { CanvasEdge, type CanvasEdgeFlowType, type CanvasEdgeData } from "@/components/editor/canvas-edge";
import { CanvasContextMenu } from "@/components/editor/canvas-context-menu";
import { ShapePanel, DRAG_DATA_KEY, type ShapeDragPayload } from "@/components/editor/shape-panel";
import { CanvasControls } from "@/components/editor/canvas-controls";
import { CanvasSaveStatus } from "@/components/editor/canvas-save-status";
import { PresenceCluster, type CollaboratorInfo } from "@/components/editor/presence-cluster";
import { LiveCursorLayer, type CursorParticipant } from "@/components/editor/live-cursor-layer";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave";
import { NODE_COLORS, type CanvasNodeData } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { computeOrganizedLayout, type LayoutDirection } from "@/lib/canvas-layout";

// --- Canvas-specific node and edge types ---

type CanvasFlowNode = Node<CanvasNodeData, "canvasNode">;

// --- Stable type registries (outside component to avoid re-renders) ---

const nodeTypes: NodeTypes = {
  canvasNode: CanvasNode,
};

const edgeTypes: EdgeTypes = {
  canvasEdge: CanvasEdge,
};

const defaultEdgeOptions = {
  type: "canvasEdge",
  reconnectable: true,
  data: {
    routing:     "smoothstep",
    color:       "var(--canvas-edge-default)",
    strokeWidth: 1.5,
    strokeDash:  "solid",
    arrowStart:  false,
    arrowEnd:    true,
  } satisfies CanvasEdgeData,
};

// Fallback accent color when cursorColor metadata is absent
const FALLBACK_CURSOR_COLOR = "var(--accent-primary)";

// --- Node ID generator ---

let nodeCounter = 0;

function generateNodeId(shape: string): string {
  return `${shape}-${Date.now()}-${++nodeCounter}`;
}

// --- Error boundary ---

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// --- Loading state ---

export function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent-primary)",
            borderRightColor: "var(--accent-primary-dim)",
          }}
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Connecting to canvas...
        </p>
      </div>
    </div>
  );
}

// --- Error state ---

export function CanvasError() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-inverse)" }}
        >
          Unable to connect to canvas
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Check your connection and try refreshing the page.
        </p>
      </div>
    </div>
  );
}

// --- Coordinate bridge: captures screenToFlowPosition from inside the ReactFlow tree ---

interface CoordinateBridgeProps {
  screenToFlowRef: React.MutableRefObject<((pos: { x: number; y: number }) => { x: number; y: number }) | null>;
}

function CoordinateBridge({ screenToFlowRef }: CoordinateBridgeProps) {
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    screenToFlowRef.current = screenToFlowPosition;
  }, [screenToFlowPosition, screenToFlowRef]);

  return null;
}

// --- React Flow canvas wired to Liveblocks ---

export type CanvasSnapshot = { nodes: unknown[]; edges: unknown[] };

interface CanvasFlowProps {
  projectId: string;
  currentUserId: string;
  onImportReady?: (fn: (template: CanvasTemplate) => void) => void;
  onAiStatusEvent?: (event: AiStatusEvent) => void;
  onCanvasReady?: (getSnapshot: () => CanvasSnapshot) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  nodeIds: string[];
  edgeIds: string[];
}

function CanvasFlow({ projectId, currentUserId, onImportReady, onAiStatusEvent, onCanvasReady }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasFlowNode, CanvasEdgeFlowType>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const screenToFlowRef = useRef<((pos: { x: number; y: number }) => { x: number; y: number }) | null>(null);
  const flowInstanceRef = useRef<ReactFlowInstance<CanvasFlowNode, CanvasEdgeFlowType> | null>(null);

  // Liveblocks history
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Restore-on-empty: hydrate room from saved blob only when room is blank.
  // A ref prevents re-running after the first attempt and blocks autosave during hydration.
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreAttemptedRef = useRef(false);

  useEffect(() => {
    if (restoreAttemptedRef.current) return;
    if (nodes.length > 0 || edges.length > 0) {
      // Room already has collaborative state — skip restore entirely
      restoreAttemptedRef.current = true;
      return;
    }

    restoreAttemptedRef.current = true;

    async function restore() {
      setIsRestoring(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !(data as Record<string, unknown>).hasSavedCanvas
        ) return;

        const canvas = (data as Record<string, unknown>).canvas as {
          nodes: unknown[];
          edges: unknown[];
        } | null;

        if (!canvas || !Array.isArray(canvas.nodes) || !Array.isArray(canvas.edges)) return;
        if (canvas.nodes.length === 0 && canvas.edges.length === 0) return;

        const addNodes = (canvas.nodes as CanvasFlowNode[]).map((n) => ({
          type: "add" as const,
          item: n,
        }));
        const addEdges = (canvas.edges as CanvasEdgeFlowType[]).map((e) => ({
          type: "add" as const,
          item: e,
        }));

        onNodesChange(addNodes);
        onEdgesChange(addEdges);

        setTimeout(() => {
          flowInstanceRef.current?.fitView({ duration: 300, padding: 0.15 });
        }, 80);
      } catch (err) {
        console.error("[CanvasFlow] restore failed", err);
      } finally {
        setIsRestoring(false);
      }
    }

    void restore();
  // Run only once on mount — intentionally empty dep array after guards
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave: debounced write to blob, disabled while restore is in flight
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);

  useEffect(() => {
    // Allow autosave only after the restore window has closed (~1.5s)
    const timer = setTimeout(() => setAutosaveEnabled(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const { saveStatus, lastSavedAt, hasPendingChanges, triggerSave } = useCanvasAutosave({
    projectId,
    nodes,
    edges,
    enabled: autosaveEnabled && !isRestoring,
  });

  // Liveblocks presence
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  // Derive collaborator list (exclude self) for presence cluster.
  // Ghost AI users are identified by the convention ghost-ai:<projectId>.
  const collaborators: CollaboratorInfo[] = others
    .filter((o) => o.id !== currentUserId)
    .map((o) => {
      const isGhostAi = o.id === `ghost-ai:${projectId}`;
      return {
        id: String(o.connectionId),
        displayName: o.info?.displayName || (isGhostAi ? "Ghost AI" : "Collaborator"),
        avatarUrl: isGhostAi ? null : (o.info?.avatarUrl || null),
        cursorColor: o.info?.cursorColor || FALLBACK_CURSOR_COLOR,
        thinking: o.presence?.thinking ?? false,
        isGhostAi,
      };
    });

  // Derive cursor participants (exclude self) for live cursor layer
  const cursorParticipants: CursorParticipant[] = others
    .filter((o) => o.id !== currentUserId)
    .map((o) => ({
      id: String(o.connectionId),
      displayName: o.info?.displayName || "Collaborator",
      cursorColor: o.info?.cursorColor || FALLBACK_CURSOR_COLOR,
      cursor: o.presence?.cursor ?? null,
      thinking: o.presence?.thinking ?? false,
    }));

  // Cursor broadcasting handlers
  const handlePaneMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const screenToFlow = screenToFlowRef.current;
      if (!screenToFlow) return;
      const flowPos = screenToFlow({ x: e.clientX, y: e.clientY });
      updateMyPresence({ cursor: flowPos });
    },
    [updateMyPresence],
  );

  const handlePaneMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Cascading deletion: remove specified nodes + all their connected edges + specified edges.
  // Uses onDelete from useLiveblocksFlow (the same path React Flow uses internally for
  // keyboard deletion) instead of separate onNodesChange/onEdgesChange calls so that both
  // the local state and Liveblocks storage are updated atomically in one operation.
  const handleDeleteItems = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      if (nodeIds.length === 0 && edgeIds.length === 0) return;
      const nodesToDelete = nodes.filter((n) => nodeIds.includes(n.id));
      const connectedEdgeIds = new Set(edgeIds);
      for (const node of nodesToDelete) {
        for (const edge of edges) {
          if (edge.source === node.id || edge.target === node.id) {
            connectedEdgeIds.add(edge.id);
          }
        }
      }
      const edgesToDelete = edges.filter((e) => connectedEdgeIds.has(e.id));
      onDelete({ nodes: nodesToDelete, edges: edgesToDelete });
    },
    [nodes, edges, onDelete],
  );

  // Delete currently selected nodes and edges
  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
    const selectedEdgeIds = edges.filter((e) => e.selected).map((e) => e.id);
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;
    handleDeleteItems(selectedNodeIds, selectedEdgeIds);
  }, [nodes, edges, handleDeleteItems]);

  // Context menu handlers
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: CanvasFlowNode) => {
      event.preventDefault();
      const targetNodeIds = node.selected
        ? nodes.filter((n) => n.selected).map((n) => n.id)
        : [node.id];
      const targetEdgeIds = node.selected
        ? edges.filter((e) => e.selected).map((e) => e.id)
        : [];
      setContextMenu({ x: event.clientX, y: event.clientY, nodeIds: targetNodeIds, edgeIds: targetEdgeIds });
    },
    [nodes, edges],
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: CanvasEdgeFlowType) => {
      event.preventDefault();
      const targetEdgeIds = edge.selected
        ? edges.filter((e) => e.selected).map((e) => e.id)
        : [edge.id];
      const targetNodeIds = edge.selected
        ? nodes.filter((n) => n.selected).map((n) => n.id)
        : [];
      setContextMenu({ x: event.clientX, y: event.clientY, nodeIds: targetNodeIds, edgeIds: targetEdgeIds });
    },
    [nodes, edges],
  );

  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const selectedNodes = nodes.filter((n) => n.selected);
      const selectedEdges = edges.filter((e) => e.selected);
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
      const { clientX, clientY } = event as React.MouseEvent;
      setContextMenu({
        x: clientX,
        y: clientY,
        nodeIds: selectedNodes.map((n) => n.id),
        edgeIds: selectedEdges.map((e) => e.id),
      });
    },
    [nodes, edges],
  );

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    flowInstanceRef.current?.zoomIn({ duration: 200 });
  }, []);

  const handleZoomOut = useCallback(() => {
    flowInstanceRef.current?.zoomOut({ duration: 200 });
  }, []);

  const handleFitView = useCallback(() => {
    flowInstanceRef.current?.fitView({ duration: 300, padding: 0.1 });
  }, []);

  // Organize: lay out all nodes in the chosen direction. Commits node positions
  // through onNodesChange and resets edge bend points (centerX/centerY) and
  // label positions (labelT) — those are stored as absolute canvas coordinates
  // and would otherwise leave edges zig-zagging through the old layout.
  const handleOrganize = useCallback(
    (direction: LayoutDirection) => {
      if (nodes.length === 0) return;

      const layout = computeOrganizedLayout(
        nodes.map((n) => ({
          id: n.id,
          width: n.width ?? null,
          height: n.height ?? null,
          measured: n.measured ?? null,
        })),
        edges.map((e) => ({ source: e.source, target: e.target })),
        direction,
      );

      const nodeChanges = nodes
        .map((n) => {
          const next = layout.get(n.id);
          if (!next) return null;
          if (n.position.x === next.x && n.position.y === next.y) return null;
          return {
            id: n.id,
            type: "position" as const,
            position: next,
            dragging: false,
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      if (nodeChanges.length > 0) onNodesChange(nodeChanges);

      // Clear stale bend points and label positions so smooth-step routing
      // recomputes against the new node positions. Use remove+add (same pattern
      // as handleReconnect) so Liveblocks Storage syncs the cleared fields.
      const dirtyEdges = edges.filter((e) => {
        const d = e.data;
        return d !== undefined && (
          d.centerX !== undefined ||
          d.centerY !== undefined ||
          d.labelT !== undefined
        );
      });

      if (dirtyEdges.length > 0) {
        const edgeChanges = dirtyEdges.flatMap((e) => {
          const { centerX: _cx, centerY: _cy, labelT: _lt, ...restData } = e.data ?? {};
          const cleaned: CanvasEdgeFlowType = {
            ...e,
            data: restData as CanvasEdgeData,
            selected: false,
          };
          return [
            { type: "remove" as const, id: e.id },
            { type: "add" as const, item: cleaned },
          ];
        });
        onEdgesChange(edgeChanges);
      }

      setTimeout(() => {
        flowInstanceRef.current?.fitView({ duration: 400, padding: 0.15 });
      }, 80);
    },
    [nodes, edges, onNodesChange, onEdgesChange],
  );

  const handleInit = useCallback((instance: ReactFlowInstance<CanvasFlowNode, CanvasEdgeFlowType>) => {
    flowInstanceRef.current = instance;
  }, []);

  // Template import: replace all nodes and edges with cloned template data
  const importFnRef = useRef<(template: CanvasTemplate) => void>(() => {});

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      const removeNodes = nodes.map((n) => ({ type: "remove" as const, id: n.id }));
      const addNodes = template.nodes.map((n) => ({
        type: "add" as const,
        item: { ...n } as CanvasFlowNode,
      }));
      onNodesChange([...removeNodes, ...addNodes]);

      const removeEdges = edges.map((e) => ({ type: "remove" as const, id: e.id }));
      const addEdges = template.edges.map((e) => ({
        type: "add" as const,
        item: { ...e } as CanvasEdgeFlowType,
      }));
      onEdgesChange([...removeEdges, ...addEdges]);

      setTimeout(() => {
        flowInstanceRef.current?.fitView({ duration: 300, padding: 0.15 });
      }, 60);
    },
    [nodes, edges, onNodesChange, onEdgesChange],
  );

  useLayoutEffect(() => {
    importFnRef.current = handleImportTemplate;
  });

  const stableImportFn = useCallback((template: CanvasTemplate) => {
    importFnRef.current(template);
  }, []);

  useEffect(() => {
    onImportReady?.(stableImportFn);
  }, [onImportReady, stableImportFn]);

  // Canvas snapshot: always reflects the latest nodes/edges at call time
  const snapshotRef = useRef<{ nodes: CanvasFlowNode[]; edges: CanvasEdgeFlowType[] }>({ nodes: [], edges: [] });
  useLayoutEffect(() => {
    snapshotRef.current = { nodes, edges };
  });
  const stableGetSnapshot = useCallback((): CanvasSnapshot => snapshotRef.current, []);
  useEffect(() => {
    onCanvasReady?.(stableGetSnapshot);
  }, [onCanvasReady, stableGetSnapshot]);

  // Forward AI_STATUS events to the sidebar
  useEventListener(({ event }) => {
    if (event.type !== "AI_STATUS" || event.projectId !== projectId) return;
    onAiStatusEvent?.(event);
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onUndo: undo,
    onRedo: redo,
    onSave: triggerSave,
    onDelete: handleDeleteSelected,
  });

  // Reconnect: replace the old edge with the same data but updated source/target
  const handleReconnect = useCallback(
    (oldEdge: CanvasEdgeFlowType, newConnection: Connection) => {
      onEdgesChange([
        { type: "remove", id: oldEdge.id },
        {
          type: "add",
          item: {
            ...oldEdge,
            source:       newConnection.source,
            target:       newConnection.target,
            sourceHandle: newConnection.sourceHandle ?? null,
            targetHandle: newConnection.targetHandle ?? null,
            selected:     false,
          },
        },
      ]);
    },
    [onEdgesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(DRAG_DATA_KEY)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const raw = e.dataTransfer.getData(DRAG_DATA_KEY);
      if (!raw) return;

      const payload = JSON.parse(raw) as ShapeDragPayload;
      const screenToFlow = screenToFlowRef.current;
      if (!screenToFlow) return;

      const center = screenToFlow({ x: e.clientX, y: e.clientY });
      const position = {
        x: center.x - payload.width / 2,
        y: center.y - payload.height / 2,
      };

      const newNode: CanvasFlowNode = {
        id: generateNodeId(payload.shape),
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: NODE_COLORS[0],
          shape: payload.shape,
        },
        width: payload.width,
        height: payload.height,
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange]
  );

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={handleReconnect}
        onDelete={onDelete}
        onInit={handleInit}
        onPaneMouseMove={handlePaneMouseMove}
        onPaneMouseLeave={handlePaneMouseLeave}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        connectionMode={ConnectionMode.Loose}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={null}
        fitView
        style={{ background: "var(--bg-canvas)" }}
      >
        <CoordinateBridge screenToFlowRef={screenToFlowRef} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--canvas-grid-default)"
        />
        <LiveCursorLayer participants={cursorParticipants} />
      </ReactFlow>

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          itemCount={contextMenu.nodeIds.length + contextMenu.edgeIds.length}
          onDelete={() => handleDeleteItems(contextMenu.nodeIds, contextMenu.edgeIds)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ShapePanel />
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOrganize={handleOrganize}
      />
      <CanvasSaveStatus
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        hasPendingChanges={hasPendingChanges}
        onSave={triggerSave}
      />
      <PresenceCluster collaborators={collaborators} />
    </div>
  );
}

// --- Canvas (inner flow, providers live in WorkspaceShell) ---

interface CanvasProps {
  roomId: string;
  currentUserId: string;
  onImportReady?: (fn: (template: CanvasTemplate) => void) => void;
  onAiStatusEvent?: (event: AiStatusEvent) => void;
  onCanvasReady?: (getSnapshot: () => CanvasSnapshot) => void;
}

export function Canvas({ roomId, currentUserId, onImportReady, onAiStatusEvent, onCanvasReady }: CanvasProps) {
  return (
    <CanvasErrorBoundary fallback={<CanvasError />}>
      <CanvasFlow
        projectId={roomId}
        currentUserId={currentUserId}
        onImportReady={onImportReady}
        onAiStatusEvent={onAiStatusEvent}
        onCanvasReady={onCanvasReady}
      />
    </CanvasErrorBoundary>
  );
}
