// Custom hierarchical layout for canvas nodes.
// Pure function — no third-party graph library. Handles DAGs, cycles, and
// disconnected components, producing a layered layout in any of four
// directions: TB (top→bottom), BT, LR (left→right), RL.

export type LayoutDirection = "TB" | "BT" | "LR" | "RL";

interface LayoutNode {
  id: string;
  width?: number | null;
  height?: number | null;
  measured?: { width?: number | null; height?: number | null } | null;
}

interface LayoutEdge {
  source: string;
  target: string;
}

interface Box {
  width: number;
  height: number;
}

const DEFAULT_NODE_W = 140;
const DEFAULT_NODE_H = 60;
const LAYER_GAP = 80;
const NODE_GAP = 40;
const COMPONENT_GAP = 96;
const ORDERING_SWEEPS = 6;

export function computeOrganizedLayout(
  nodes: ReadonlyArray<LayoutNode>,
  edges: ReadonlyArray<LayoutEdge>,
  direction: LayoutDirection,
): Map<string, { x: number; y: number }> {
  if (nodes.length === 0) return new Map();

  const boxes = new Map<string, Box>();
  for (const n of nodes) {
    const w = n.width ?? n.measured?.width ?? DEFAULT_NODE_W;
    const h = n.height ?? n.measured?.height ?? DEFAULT_NODE_H;
    boxes.set(n.id, { width: w, height: h });
  }

  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const id of boxes.keys()) {
    outgoing.set(id, []);
    incoming.set(id, []);
  }
  for (const e of edges) {
    if (!boxes.has(e.source) || !boxes.has(e.target)) continue;
    if (e.source === e.target) continue;
    outgoing.get(e.source)!.push(e.target);
    incoming.get(e.target)!.push(e.source);
  }

  const components = findComponents(Array.from(boxes.keys()), edges, boxes);
  const isVertical = direction === "TB" || direction === "BT";
  const result = new Map<string, { x: number; y: number }>();

  let stackOffset = 0;
  for (const componentIds of components) {
    const componentLayout = layoutComponent(
      componentIds,
      boxes,
      outgoing,
      incoming,
      direction,
    );

    let minA = Infinity, maxA = -Infinity;
    let minB = Infinity, maxB = -Infinity;
    for (const [id, pos] of componentLayout) {
      const box = boxes.get(id)!;
      const a = isVertical ? pos.x : pos.y;
      const b = isVertical ? pos.y : pos.x;
      const aSize = isVertical ? box.width : box.height;
      const bSize = isVertical ? box.height : box.width;
      if (a < minA) minA = a;
      if (a + aSize > maxA) maxA = a + aSize;
      if (b < minB) minB = b;
      if (b + bSize > maxB) maxB = b + bSize;
    }
    if (!isFinite(minA)) { minA = 0; maxA = 0; minB = 0; maxB = 0; }

    const offsetA = stackOffset - minA;
    const normalizeB = -minB;

    for (const [id, pos] of componentLayout) {
      if (isVertical) {
        result.set(id, { x: pos.x + offsetA, y: pos.y + normalizeB });
      } else {
        result.set(id, { x: pos.x + normalizeB, y: pos.y + offsetA });
      }
    }

    stackOffset += (maxA - minA) + COMPONENT_GAP;
  }

  return result;
}

function findComponents(
  nodeIds: string[],
  edges: ReadonlyArray<LayoutEdge>,
  boxes: Map<string, Box>,
): string[][] {
  const parent = new Map<string, string>();
  for (const id of nodeIds) parent.set(id, id);

  const find = (x: string): string => {
    let cur = x;
    while (parent.get(cur)! !== cur) cur = parent.get(cur)!;
    let node = x;
    while (parent.get(node)! !== cur) {
      const next = parent.get(node)!;
      parent.set(node, cur);
      node = next;
    }
    return cur;
  };

  for (const e of edges) {
    if (!boxes.has(e.source) || !boxes.has(e.target)) continue;
    const ra = find(e.source);
    const rb = find(e.target);
    if (ra !== rb) parent.set(ra, rb);
  }

  const groups = new Map<string, string[]>();
  for (const id of nodeIds) {
    const root = find(id);
    let arr = groups.get(root);
    if (!arr) { arr = []; groups.set(root, arr); }
    arr.push(id);
  }

  return Array.from(groups.values());
}

function layoutComponent(
  componentIds: string[],
  boxes: Map<string, Box>,
  outgoing: Map<string, string[]>,
  incoming: Map<string, string[]>,
  direction: LayoutDirection,
): Map<string, { x: number; y: number }> {
  const isVertical = direction === "TB" || direction === "BT";
  const inComp = new Set(componentIds);

  const compIn = new Map<string, string[]>();
  const compOut = new Map<string, string[]>();
  for (const id of componentIds) {
    compIn.set(id, (incoming.get(id) ?? []).filter((p) => inComp.has(p)));
    compOut.set(id, (outgoing.get(id) ?? []).filter((c) => inComp.has(c)));
  }

  const layerOf = assignLayers(componentIds, compIn);

  let maxLayer = 0;
  const layerMap = new Map<number, string[]>();
  for (const id of componentIds) {
    const l = layerOf.get(id)!;
    if (l > maxLayer) maxLayer = l;
    let arr = layerMap.get(l);
    if (!arr) { arr = []; layerMap.set(l, arr); }
    arr.push(id);
  }
  const layers: string[][] = [];
  for (let i = 0; i <= maxLayer; i++) {
    layers.push((layerMap.get(i) ?? []).slice());
  }

  orderLayers(layers, compIn, compOut);

  const layerExtents = layers.map((layerNodes) => {
    const offsets = new Map<string, number>();
    let cursor = 0;
    for (const id of layerNodes) {
      offsets.set(id, cursor);
      const box = boxes.get(id)!;
      cursor += (isVertical ? box.width : box.height) + NODE_GAP;
    }
    const totalSize = layerNodes.length === 0 ? 0 : Math.max(0, cursor - NODE_GAP);
    return { totalSize, nodeOffsets: offsets };
  });

  const maxExtent = layerExtents.reduce((m, l) => Math.max(m, l.totalSize), 0);

  const layerThicknesses = layers.map((layerNodes) => {
    let t = 0;
    for (const id of layerNodes) {
      const box = boxes.get(id)!;
      const dim = isVertical ? box.height : box.width;
      if (dim > t) t = dim;
    }
    return t;
  });

  const flowOffsets: number[] = [];
  let flowCursor = 0;
  for (let i = 0; i < layers.length; i++) {
    flowOffsets.push(flowCursor);
    flowCursor += layerThicknesses[i] + LAYER_GAP;
  }
  const totalFlow = layers.length === 0 ? 0 : Math.max(0, flowCursor - LAYER_GAP);
  const flipFlow = direction === "BT" || direction === "RL";

  const result = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < layers.length; i++) {
    const layerNodes = layers[i];
    const { totalSize, nodeOffsets } = layerExtents[i];
    const layerStart = (maxExtent - totalSize) / 2;
    const flowPos = flipFlow
      ? totalFlow - flowOffsets[i] - layerThicknesses[i]
      : flowOffsets[i];

    for (const id of layerNodes) {
      const offset = nodeOffsets.get(id)!;
      const box = boxes.get(id)!;
      const thickness = isVertical ? box.height : box.width;
      // Center each node in its layer's thickness band so mixed sizes line up.
      const flowCentered = flowPos + (layerThicknesses[i] - thickness) / 2;
      if (isVertical) {
        result.set(id, { x: layerStart + offset, y: flowCentered });
      } else {
        result.set(id, { x: flowCentered, y: layerStart + offset });
      }
    }
  }

  return result;
}

function assignLayers(
  componentIds: string[],
  compIn: Map<string, string[]>,
): Map<string, number> {
  const layer = new Map<string, number>();
  for (const id of componentIds) layer.set(id, 0);

  const N = componentIds.length;
  const cap = Math.max(0, N - 1);

  for (let iter = 0; iter < N; iter++) {
    let changed = false;
    for (const id of componentIds) {
      const parents = compIn.get(id) ?? [];
      if (parents.length === 0) continue;
      let maxParent = -1;
      for (const p of parents) {
        const pl = layer.get(p) ?? 0;
        if (pl > maxParent) maxParent = pl;
      }
      const proposed = Math.min(maxParent + 1, cap);
      if (proposed > (layer.get(id) ?? 0)) {
        layer.set(id, proposed);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return layer;
}

function orderLayers(
  layers: string[][],
  compIn: Map<string, string[]>,
  compOut: Map<string, string[]>,
): void {
  const pos = new Map<string, number>();
  for (const layer of layers) layer.forEach((id, i) => pos.set(id, i));

  for (let sweep = 0; sweep < ORDERING_SWEEPS; sweep++) {
    const downward = sweep % 2 === 0;
    for (let step = 0; step < layers.length; step++) {
      const i = downward ? step : layers.length - 1 - step;
      const layer = layers[i];
      if (layer.length <= 1) continue;
      const neighbors = downward ? compIn : compOut;

      const bary = new Map<string, number>();
      for (const id of layer) {
        const ns = neighbors.get(id) ?? [];
        if (ns.length === 0) {
          bary.set(id, pos.get(id) ?? 0);
        } else {
          let sum = 0;
          let count = 0;
          for (const n of ns) {
            const p = pos.get(n);
            if (p !== undefined) { sum += p; count++; }
          }
          bary.set(id, count === 0 ? (pos.get(id) ?? 0) : sum / count);
        }
      }

      layer.sort((a, b) => {
        const ba = bary.get(a)!;
        const bb = bary.get(b)!;
        if (ba !== bb) return ba - bb;
        return (pos.get(a) ?? 0) - (pos.get(b) ?? 0);
      });

      layer.forEach((id, idx) => pos.set(id, idx));
    }
  }
}
