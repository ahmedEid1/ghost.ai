import { Ghost, Sparkles, Users, FileCode } from "lucide-react";

const features = [
  {
    Icon: Sparkles,
    label: "AI-powered canvas",
    desc: "Describe your architecture in plain English — Ghost maps it instantly.",
  },
  {
    Icon: Users,
    label: "Real-time collaboration",
    desc: "Invite teammates to co-design and annotate in shared workspaces.",
  },
  {
    Icon: FileCode,
    label: "Auto-generate specs",
    desc: "Export clean technical documentation directly from your canvas.",
  },
];

export function AuthPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-14 overflow-hidden bg-surface border-r border-border-default">
      {/* Ambient glow layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 25%, rgba(0,200,212,0.07) 0%, transparent 65%), radial-gradient(ellipse 55% 45% at 85% 75%, rgba(100,87,249,0.08) 0%, transparent 60%)",
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Top-edge accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-14 right-14 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,200,212,0.35) 40%, rgba(100,87,249,0.3) 70%, transparent 100%)",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary-dim border border-border-subtle">
          <Ghost className="h-4 w-4 text-accent-primary" />
        </div>
        <span className="text-base font-bold text-text-primary tracking-tight">
          Ghost<span className="text-accent-primary">AI</span>
        </span>
      </div>

      {/* Hero + features */}
      <div className="relative z-10 space-y-10">
        <div className="space-y-4">
          <h1 className="text-[2.6rem] font-bold text-text-primary leading-[1.12] tracking-tight">
            Design systems,
            <br />
            <span className="text-accent-primary">not diagrams.</span>
          </h1>
          <p className="text-text-secondary text-[15px] leading-relaxed max-w-[360px]">
            Describe your architecture in plain English. Ghost AI maps it onto a
            collaborative canvas and generates a ready-to-share technical spec.
          </p>
        </div>

        <div className="space-y-5">
          {features.map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim border border-border-default">
                <Icon className="h-3.5 w-3.5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-0.5">
                  {label}
                </p>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs text-text-faint">
        © 2026 GhostAI · All rights reserved.
      </p>
    </div>
  );
}
