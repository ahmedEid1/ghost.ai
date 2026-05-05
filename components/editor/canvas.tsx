"use client";

import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useUpdateMyPresence } from "@liveblocks/react";
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
  type EdgeChange,
  type NodeChange,
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
    color:       "rgba(255,255,255,0.55)",
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

function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent-primary)",
            borderRightColor: "var(--accent-primary-dim)",
          }}
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Connecting to canvas…
        </p>
      </div>
    </div>
  );
}

// --- Error state ---

function CanvasError() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
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

interface CanvasFlowProps {
  projectId: string;
  currentUserId: string;
  onImportReady?: (fn: (template: CanvasTemplate) => void) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  nodeIds: string[];
  edgeIds: string[];
}

function CanvasFlow({ projectId, currentUserId, onImportReady }: CanvasFlowProps) {
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
  const isRestoringRef = useRef(false);
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
      isRestoringRef.current = true;
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
        isRestoringRef.current = false;
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
    enabled: autosaveEnabled && !isRestoringRef.current,
  });

  // Liveblocks presence
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  // Derive collaborator list (exclude self) for presence cluster
  const collaborators: CollaboratorInfo[] = others
    .filter((o) => o.id !== currentUserId)
    .map((o) => ({
      id: String(o.connectionId),
      displayName: o.info?.displayName || "Collaborator",
      avatarUrl: o.info?.avatarUrl || null,
      cursorColor: o.info?.cursorColor || FALLBACK_CURSOR_COLOR,
    }));

  // Derive cursor participants (exclude self) for live cursor layer
  const cursorParticipants: CursorParticipant[] = others
    .filter((o) => o.id !== currentUserId)
    .map((o) => ({
      id: String(o.connectionId),
      displayName: o.info?.displayName || "Collaborator",
      cursorColor: o.info?.cursorColor || FALLBACK_CURSOR_COLOR,
      cursor: o.presence?.cursor ?? null,
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

  // Cascading deletion: remove specified nodes + all their connected edges + specified edges
  const handleDeleteItems = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      const edgeIdsToRemove = new Set(edgeIds);
      for (const nid of nodeIds) {
        for (const edge of edges) {
          if (edge.source === nid || edge.target === nid) {
            edgeIdsToRemove.add(edge.id);
          }
        }
      }
      const nodeChanges: NodeChange<CanvasFlowNode>[] = nodeIds.map((id) => ({ type: "remove", id }));
      const edgeChanges: EdgeChange<CanvasEdgeFlowType>[] = [...edgeIdsToRemove].map((id) => ({ type: "remove", id }));
      if (nodeChanges.length > 0) onNodesChange(nodeChanges);
      if (edgeChanges.length > 0) onEdgesChange(edgeChanges);
    },
    [edges, onNodesChange, onEdgesChange],
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
        style={{ background: "var(--bg-base)" }}
      >
        <CoordinateBridge screenToFlowRef={screenToFlowRef} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--text-primary)"
          style={{ opacity: 0.08 }}
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

// --- Canvas (Liveblocks + Room provider wrapper) ---

interface CanvasProps {
  roomId: string;
  onImportReady?: (fn: (template: CanvasTemplate) => void) => void;
}

export function Canvas({ roomId, onImportReady }: CanvasProps) {
  const { user, isLoaded } = useUser();

  const authEndpoint = useCallback(
    async (room: string | undefined) => {
      if (!user) return { error: "forbidden", reason: "Not authenticated" };

      const displayName =
        user.fullName ??
        user.emailAddresses[0]?.emailAddress ??
        "Anonymous";

      const response = await fetch("/api/liveblocks-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          roomId: room ?? roomId,
          displayName,
          avatarUrl: user.imageUrl ?? "",
        }),
      });

      if (response.status === 403) {
        return { error: "forbidden", reason: "Access denied" };
      }

      return response.json();
    },
    [user, roomId]
  );

  if (!isLoaded) return <CanvasLoading />;
  if (!user) return <CanvasError />;

  return (
    <LiveblocksProvider authEndpoint={authEndpoint}>
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <CanvasErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <CanvasFlow
              projectId={roomId}
              currentUserId={user.id}
              onImportReady={onImportReady}
            />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
