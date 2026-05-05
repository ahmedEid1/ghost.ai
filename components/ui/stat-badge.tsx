"use client";

import React, { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "ai" | "collab";

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState<number>(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef<number>(target);

  useEffect(() => {
    if (target === fromRef.current) return;
    const start = performance.now();
    startRef.current = start;
    const from = fromRef.current;
    const delta = target - from;

    const step = (ts: number) => {
      const elapsed = ts - (startRef.current ?? ts);
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(from + delta * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [target, duration]);

  return value;
}

export default function StatBadge({
  icon: Icon,
  label,
  value,
  tone = "primary",
  animateCount = true,
  pulseOnUpdate = true,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: Tone;
  animateCount?: boolean;
  pulseOnUpdate?: boolean;
}) {
  const numeric = typeof value === "number" ? value : parseInt(String(value), 10) || 0;
  const countedValue = useCountUp(numeric, 600);
  const display = animateCount ? countedValue : numeric;
  const [isPulse, setIsPulse] = useState(false);
  const prevRef = useRef<number>(numeric);

  useEffect(() => {
    if (!pulseOnUpdate) return;
    if (numeric !== prevRef.current) {
      setIsPulse(true);
      const t = setTimeout(() => setIsPulse(false), 600);
      prevRef.current = numeric;
      return () => clearTimeout(t);
    }
  }, [numeric, pulseOnUpdate]);

  const toneClass =
    tone === "ai"
      ? "bg-accent-ai-dim text-accent-ai-text"
      : tone === "collab"
      ? "bg-accent-collab-dim text-accent-collab"
      : "bg-accent-primary-dim text-accent-primary";

  return (
    <div className="relative">
      <div className="group relative rounded-2xl border border-border-default bg-surface p-3 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-panel)]">
        <div className="absolute -left-3 -top-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass} ring-1 ring-border-subtle transform ${isPulse ? "scale-105 motion-safe:animate-pulse" : ""} transition-all duration-300`}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col">
            <p className="text-lg font-semibold leading-none text-text-primary tabular-nums">{display}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
