export interface NodeColor {
  fill: string;
  text: string;
  name: string;
}

export const NODE_COLORS = [
  { fill: "#18202F", text: "#F8FAFC", name: "Graphite" },
  { fill: "#0F274A", text: "#93C5FD", name: "Blue"     },
  { fill: "#2D1B55", text: "#C4B5FD", name: "Violet"   },
  { fill: "#3A2508", text: "#FBBF24", name: "Amber"    },
  { fill: "#3A1824", text: "#FB7185", name: "Rose"     },
  { fill: "#331B3F", text: "#F0ABFC", name: "Fuchsia"  },
  { fill: "#103322", text: "#86EFAC", name: "Green"    },
  { fill: "#092F33", text: "#5EEAD4", name: "Teal"     },
] as const satisfies readonly NodeColor[];

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export const NODE_SHAPES: NodeShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
];

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: NodeColor;
  shape: NodeShape;
}

export type CanvasNodeType = "canvasNode";
export type CanvasEdgeType = "canvasEdge";
