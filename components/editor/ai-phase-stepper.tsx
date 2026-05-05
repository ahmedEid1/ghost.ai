"use client";

import { Check, AlertCircle } from "lucide-react";

export interface AiPhaseStep {
  id: string;
  label: string;
}

interface AiPhaseStepperProps {
  steps: AiPhaseStep[];
  currentPhase: string | null;
  isError?: boolean;
  errorMessage?: string | null;
}

function getStepState(
  stepId: string,
  currentPhase: string | null,
  steps: AiPhaseStep[],
  doneIds: ReadonlySet<string>,
): "pending" | "active" | "done" {
  if (currentPhase && doneIds.has(currentPhase)) return "done";
  if (currentPhase === stepId) return "active";
  if (!currentPhase) return "pending";

  const currentIdx = steps.findIndex((s) => s.id === currentPhase);
  const stepIdx = steps.findIndex((s) => s.id === stepId);
  if (currentIdx === -1) return "pending";
  return stepIdx < currentIdx ? "done" : "pending";
}

const DONE_PHASE_IDS: ReadonlySet<string> = new Set(["complete", "done"]);

export function AiPhaseStepper({
  steps,
  currentPhase,
  isError,
  errorMessage,
}: AiPhaseStepperProps) {
  if (isError) {
    return (
      <div className="flex shrink-0 items-start gap-2 border-t border-border-default bg-state-error/10 px-3 py-2">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-state-error" />
        <span className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-state-error">
          {errorMessage ?? "Run failed"}
        </span>
      </div>
    );
  }

  const activeStep =
    steps.find((s) => s.id === currentPhase) ??
    (currentPhase && DONE_PHASE_IDS.has(currentPhase)
      ? steps[steps.length - 1]
      : steps[0]);

  return (
    <div className="flex shrink-0 flex-col gap-1.5 border-t border-border-default bg-accent-ai-dim px-3 py-2">
      <div className="flex items-center" role="progressbar" aria-label="AI run progress">
        {steps.map((step, idx) => {
          const state = getStepState(step.id, currentPhase, steps, DONE_PHASE_IDS);
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-initial">
              <div
                aria-current={state === "active" ? "step" : undefined}
                className={
                  "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200 " +
                  (state === "done"
                    ? "bg-accent-ai-text text-text-inverse"
                    : state === "active"
                      ? "bg-accent-ai-text text-text-inverse"
                      : "bg-surface text-text-faint ring-1 ring-inset ring-border-default")
                }
              >
                {state === "done" ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : state === "active" ? (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-accent-ai-text motion-safe:animate-ping motion-safe:opacity-50"
                    />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-text-inverse" />
                  </>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-text-faint/50" />
                )}
              </div>
              {!isLast && (
                <div
                  aria-hidden
                  className={
                    "mx-1 h-px flex-1 transition-colors duration-300 " +
                    (state === "done" ? "bg-accent-ai-text" : "bg-border-default")
                  }
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="truncate text-[11px] font-medium leading-none text-accent-ai-text">
        {activeStep?.label ?? "Working..."}
      </p>
    </div>
  );
}
