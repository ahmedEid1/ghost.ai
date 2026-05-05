import { BrainCircuit, FileCode, GitBranch, Ghost, Sparkles, Users } from "lucide-react";

const proofPoints = [
  { Icon: BrainCircuit, label: "Claude agent", value: "validated plans" },
  { Icon: Users, label: "Liveblocks", value: "multiplayer canvas" },
  { Icon: FileCode, label: "Specs", value: "Markdown artifacts" },
];

const previewNodes = [
  { label: "Client", className: "left-8 top-8 border-accent-collab/60 bg-accent-collab-dim text-accent-collab" },
  { label: "API", className: "left-36 top-20 border-accent-primary/60 bg-accent-primary-dim text-accent-primary" },
  { label: "Jobs", className: "right-8 top-10 border-accent-ai/60 bg-accent-ai-dim text-accent-ai-text" },
  { label: "Postgres", className: "left-16 bottom-10 border-state-success/50 bg-state-success/10 text-state-success" },
  { label: "Blob", className: "right-16 bottom-12 border-state-warning/50 bg-state-warning/10 text-state-warning" },
];

export function AuthPanel() {
  return (
    <div className="relative hidden overflow-hidden border-r border-border-default bg-surface p-10 lg:flex lg:w-[52%] xl:w-[55%]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      <div className="relative z-10 flex min-h-full w-full flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-accent-primary-dim">
            <Ghost className="h-4 w-4 text-accent-primary" />
          </div>
          <span className="text-base font-bold tracking-tight text-text-primary">
            Ghost<span className="text-accent-primary">AI</span>
          </span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
          <div className="max-w-md space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-elevated px-3 py-1 text-xs font-medium text-text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-accent-ai-text" />
              Applied AI system design studio
            </div>
            <div className="space-y-3">
              <h1 className="text-[2.7rem] font-semibold leading-[1.05] tracking-tight text-text-primary">
                Ship the architecture, not just the idea.
              </h1>
              <p className="max-w-sm text-[15px] leading-7 text-text-secondary">
                Prompt Ghost AI, refine the shared canvas, and export the technical spec that proves the system is buildable.
              </p>
            </div>
          </div>

          <div className="studio-panel-strong relative min-h-[360px] overflow-hidden rounded-3xl bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-ai-dim">
                  <BrainCircuit className="h-4 w-4 text-accent-ai-text" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Architecture run</p>
                  <p className="text-xs text-text-muted">planning with validated canvas mutations</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-state-success/10 px-2 py-1 text-[11px] font-medium text-state-success">
                <span
                  aria-hidden
                  className="ghost-pulse-dot block h-1.5 w-1.5 rounded-full bg-state-success"
                />
                live
              </span>
            </div>

            <div className="relative h-60 overflow-hidden rounded-2xl bg-canvas">
              <div
                aria-hidden
                className="absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgb(255 255 255 / 16%) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <path
                  d="M74 62 C132 70 143 96 180 112"
                  fill="none"
                  stroke="rgb(148 163 184 / 55%)"
                  strokeWidth="1.6"
                  className="ghost-flow-dashed"
                />
                <path
                  d="M206 112 C244 92 266 78 308 66"
                  fill="none"
                  stroke="rgb(148 163 184 / 55%)"
                  strokeWidth="1.6"
                  className="ghost-flow-dashed"
                  style={{ animationDelay: "0.4s" }}
                />
                <path
                  d="M180 130 C142 158 126 174 104 198"
                  fill="none"
                  stroke="rgb(148 163 184 / 45%)"
                  strokeWidth="1.4"
                  className="ghost-flow-dashed"
                  style={{ animationDelay: "0.2s" }}
                />
                <path
                  d="M218 130 C255 160 273 176 292 196"
                  fill="none"
                  stroke="rgb(148 163 184 / 45%)"
                  strokeWidth="1.4"
                  className="ghost-flow-dashed"
                  style={{ animationDelay: "0.6s" }}
                />
              </svg>
              {previewNodes.map((node) => (
                <div
                  key={node.label}
                  className={`absolute rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm ${node.className}`}
                >
                  {node.label}
                </div>
              ))}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
                <GitBranch className="h-3.5 w-3.5" />
                Ghost applies graph updates
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {proofPoints.map(({ Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-border-default bg-elevated px-3 py-2">
                  <Icon className="mb-2 h-4 w-4 text-accent-primary" />
                  <p className="text-[11px] font-semibold text-text-primary">{label}</p>
                  <p className="truncate text-[10px] text-text-muted">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-faint">
          Portfolio-grade full-stack AI product.
        </p>
      </div>
    </div>
  );
}
