import type { AiStatusEvent } from "@/liveblocks.config";

const VALID_PHASES = new Set([
  "started",
  "reading-canvas",
  "planning",
  "validating",
  "applying",
  "complete",
  "error",
]);

export function parseAiStatusEvent(event: unknown): AiStatusEvent | null {
  if (typeof event !== "object" || event === null) return null;
  const e = event as Record<string, unknown>;
  if (e.type !== "AI_STATUS") return null;
  if (typeof e.projectId !== "string" || !e.projectId) return null;
  if (typeof e.runId !== "string" || !e.runId) return null;
  if (typeof e.phase !== "string" || !VALID_PHASES.has(e.phase)) return null;
  if (typeof e.message !== "string") return null;
  if (typeof e.at !== "string" || !e.at) return null;
  if (e.nodeCount !== undefined && typeof e.nodeCount !== "number") return null;
  if (e.edgeCount !== undefined && typeof e.edgeCount !== "number") return null;
  return e as unknown as AiStatusEvent;
}
