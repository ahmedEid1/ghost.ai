"use client";

import { FileCode2, Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpecsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      {/* Generate action */}
      <button
        type="button"
        disabled
        aria-label="Generate spec (coming soon)"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ color: "white" }}
      >
        <Wand2 className="h-4 w-4" />
        Generate Spec
      </button>

      {/* Demo spec card */}
      <div className="rounded-2xl border border-border-default bg-elevated p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim">
            <FileCode2 className="h-4 w-4 text-accent-ai-text" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              System Architecture Spec
            </p>
            <p className="line-clamp-3 text-xs leading-relaxed text-text-muted">
              A complete specification of your canvas architecture — covering
              all components, services, data flows, and integration boundaries.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border-default pt-3">
          <span className="text-xs text-text-faint">v1.0 · Draft</span>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-7 gap-1.5 rounded-lg text-xs text-text-muted"
            aria-label="Download spec (unavailable)"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>

      {/* Future-state hint */}
      <p className="text-center text-xs leading-relaxed text-text-faint">
        Spec generation will analyze your canvas and produce a structured
        document ready to export or share.
      </p>
    </div>
  );
}
