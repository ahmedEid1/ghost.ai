"use client";

import { Component, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

import { CanvasNode } from "@/components/editor/canvas-node";
import { ShapePanel, DRAG_DATA_KEY, type ShapeDragPayload } from "@/components/editor/shape-panel";
import { NODE_COLORS, type CanvasNodeData } from "@/types/canvas";

// --- Canvas-specific node type ---

type CanvasFlowNode = Node<CanvasNodeData, "canvasNode">;

// --- Node types (stable reference outside component) ---

const nodeTypes: NodeTypes = {
  canvasNode: CanvasNode,
};

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

function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasFlowNode, Edge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const screenToFlowRef = useRef<((pos: { x: number; y: number }) => { x: number; y: number }) | null>(null);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
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
        <MiniMap
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
          }}
          nodeColor="var(--accent-primary)"
          maskColor="rgba(0,0,0,0.4)"
        />
        <Cursors />
      </ReactFlow>

      <ShapePanel />
    </div>
  );
}

// --- Canvas (Liveblocks + Room provider wrapper) ---

interface CanvasProps {
  roomId: string;
}

export function Canvas({ roomId }: CanvasProps) {
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
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CanvasErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <CanvasFlow />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
