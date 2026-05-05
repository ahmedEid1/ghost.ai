import { useState, useCallback } from "react";
import type { AiStatusEvent } from "@/liveblocks.config";

export interface AiActivityState {
  latestStatus: AiStatusEvent | null;
  activeRunId: string | null;
  isActive: boolean;
  phase: AiStatusEvent["phase"] | null;
  message: string | null;
}

const ACTIVE_PHASES = new Set([
  "started",
  "reading-canvas",
  "planning",
  "validating",
  "applying",
]);

const INITIAL_STATE: AiActivityState = {
  latestStatus: null,
  activeRunId: null,
  isActive: false,
  phase: null,
  message: null,
};

export function useAiActivityState(projectId: string) {
  const [state, setState] = useState<AiActivityState>(INITIAL_STATE);

  const handleStatusEvent = useCallback(
    (event: AiStatusEvent) => {
      if (event.projectId !== projectId) return;

      setState((prev) => {
        const isActive = ACTIVE_PHASES.has(event.phase);

        // New run starting — replace all previous state
        if (event.phase === "started" && event.runId !== prev.activeRunId) {
          return {
            latestStatus: event,
            activeRunId: event.runId,
            isActive: true,
            phase: event.phase,
            message: event.message,
          };
        }

        // Ignore updates for a different run when one is already active
        if (prev.activeRunId !== null && event.runId !== prev.activeRunId) {
          return prev;
        }

        return {
          latestStatus: event,
          activeRunId: isActive ? event.runId : null,
          isActive,
          phase: event.phase,
          message: event.message,
        };
      });
    },
    [projectId],
  );

  return { state, handleStatusEvent };
}
