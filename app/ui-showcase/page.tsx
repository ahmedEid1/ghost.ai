"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Sparkles,
  Users,
  Code2,
  Database,
  Workflow,
  ShieldCheck,
  Cpu,
  Layers,
  Wand2,
  GitBranch,
  Activity,
  Copy,
} from "lucide-react";

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

const SECTIONS = [
  { id: "vignettes", label: "Live surfaces" },
  { id: "color", label: "Color" },
  { id: "motion", label: "Motion" },
  { id: "components", label: "Components" },
  { id: "stack", label: "Stack" },
] as const;

export default function UIShowcase() {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      <TopNav />
      <Hero />
      <main className="max-w-6xl mx-auto px-6 sm:px-8 pb-24 space-y-28">
        <Reveal id="vignettes">
          <VignettesSection />
        </Reveal>
        <Reveal id="color">
          <ColorSection />
        </Reveal>
        <Reveal id="motion">
          <MotionSection />
        </Reveal>
        <Reveal id="components">
          <ComponentsSection />
        </Reveal>
        <Reveal id="stack">
          <StackSection />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

/* ---------------------------------------------------------------- TopNav */

function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2 font-semibold">
          <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent-primary text-text-inverse">
            <span className="absolute inset-0 rounded-md bg-accent-primary animate-pulse-ring" />
            <Sparkles className="relative h-3.5 w-3.5" />
          </span>
          Ghost AI
          <span className="text-text-faint font-normal hidden sm:inline">/ design system</span>
        </a>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent-primary text-text-inverse text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            Open editor
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border-subtle">
      <GridBackdrop />
      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/70 backdrop-blur px-3 py-1 text-xs font-medium text-text-secondary animate-fade-in">
          <span className="ghost-pulse-dot h-1.5 w-1.5 rounded-full bg-accent-ai" />
          Studio palette / token-driven / motion-aware
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold max-w-3xl leading-[1.05]">
          The design language behind a real-time, AI-native system design studio.
        </h1>
        <p className="mt-5 max-w-2xl text-text-secondary text-base sm:text-lg leading-relaxed">
          Ghost AI generates validated architecture diagrams from natural language, syncs them across
          a live canvas, and ships structured specs, all backed by durable workflows. This page is
          the visual contract: every color, every motion, every component on the surface.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-primary text-text-inverse text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            Open the editor
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#vignettes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-default bg-surface text-text-primary text-sm font-medium hover:bg-elevated transition-colors"
          >
            See it move
          </a>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
          {[
            { label: "Next.js 16", sub: "RSC + Turbopack" },
            { label: "Liveblocks", sub: "CRDT realtime" },
            { label: "Trigger.dev", sub: "durable AI tasks" },
            { label: "Claude", sub: "schema-validated" },
          ].map((tag) => (
            <div
              key={tag.label}
              className="rounded-xl border border-border-subtle bg-surface/60 backdrop-blur px-3 py-2.5"
            >
              <div className="text-sm font-medium text-text-primary">{tag.label}</div>
              <div className="text-xs text-text-muted">{tag.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--canvas-grid-default) 1px, transparent 1px), linear-gradient(to bottom, var(--canvas-grid-default) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------- Reveal helper */

function Reveal({ id, children }: { id?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className="scroll-mt-20"
      style={{
        opacity: shown || prefersReducedMotion ? 1 : 0,
        transform: prefersReducedMotion ? "none" : shown ? "translateY(0)" : "translateY(8px)",
        transition: prefersReducedMotion
          ? "opacity 200ms ease-out"
          : "opacity 500ms ease-out, transform 500ms ease-out",
      }}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------ SectionTitle */

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <div className="text-xs font-mono uppercase tracking-[0.18em] text-accent-ai">{eyebrow}</div>
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">{title}</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

/* ----------------------------------------------------------- Live vignettes */

function VignettesSection() {
  return (
    <div>
      <SectionTitle
        eyebrow="Live surfaces"
        title="The product, in three motions."
        desc="Every claim about realtime, AI, and durability is wired to a live vignette so the page exercises the same motion vocabulary the editor does."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AIVignette />
        <PresenceVignette />
        <WorkflowVignette />
      </div>
    </div>
  );
}

function AIVignette() {
  const prefersReducedMotion = useReducedMotionPreference();
  const [chunks, setChunks] = useState(0);
  const phrases = useMemo(
    () => [
      "Ingest gateway -> ",
      "rate-limited queue -> ",
      "stream processor -> ",
      "warehouse -> ",
      "dashboards.",
    ],
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => {
      setChunks((c) => (c + 1) % (phrases.length + 4));
    }, 700);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, phrases.length]);

  const visibleChunks = prefersReducedMotion ? phrases.length : chunks;

  return (
    <div className="studio-panel rounded-2xl p-5 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-ai-dim)] text-accent-ai">
            <Wand2 className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-sm font-semibold">AI generation</div>
            <div className="text-xs text-text-muted">Trigger.dev to Claude to room</div>
          </div>
        </div>
        <span className="ghost-pulse-dot h-2 w-2 rounded-full bg-accent-ai" />
      </div>

      <div
        className="relative h-32 rounded-xl border border-border-subtle overflow-hidden"
        style={{ background: "var(--bg-canvas)" }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 128" fill="none">
          <rect x="14" y="46" width="64" height="36" rx="8" fill="var(--accent-ai-dim)" stroke="var(--accent-ai)" />
          <rect x="128" y="46" width="64" height="36" rx="8" fill="var(--accent-primary-dim)" stroke="var(--accent-primary)" />
          <rect x="242" y="46" width="64" height="36" rx="8" fill="var(--accent-collab-dim)" stroke="var(--accent-collab)" />
          <path d="M78 64 L128 64" stroke="var(--accent-ai)" strokeWidth="1.5" className="ghost-flow-dashed" />
          <path d="M192 64 L242 64" stroke="var(--accent-primary)" strokeWidth="1.5" className="ghost-flow-dashed" />
        </svg>
      </div>

      <div className="font-mono text-xs text-text-secondary min-h-[3rem] leading-relaxed">
        {phrases.slice(0, Math.min(visibleChunks, phrases.length)).join("")}
        {visibleChunks < phrases.length && (
          <span className="inline-block h-3 w-1.5 align-middle bg-accent-ai animate-pulse" />
        )}
      </div>
    </div>
  );
}

function PresenceVignette() {
  const prefersReducedMotion = useReducedMotionPreference();
  const peers = [
    { name: "Ada", color: "var(--accent-primary)" },
    { name: "Ken", color: "var(--accent-ai)" },
    { name: "Mira", color: "var(--accent-collab)" },
    { name: "Jun", color: "var(--state-warning)" },
  ];

  const [active, setActive] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => setActive((a) => (a + 1) % peers.length), 1200);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, peers.length]);

  const activePeer = prefersReducedMotion ? 0 : active;

  return (
    <div className="studio-panel rounded-2xl p-5 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-collab-dim)] text-accent-collab">
            <Users className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Real-time presence</div>
            <div className="text-xs text-text-muted">Liveblocks / typed presence</div>
          </div>
        </div>
        <div className="flex -space-x-1.5">
          {peers.map((p, i) => (
            <div
              key={p.name}
              className="h-6 w-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-semibold text-text-inverse transition-transform"
              style={{
                background: p.color,
                transform: i === activePeer ? "translateY(-2px)" : "translateY(0)",
              }}
              title={p.name}
            >
              {p.name[0]}
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative h-32 rounded-xl border border-border-subtle overflow-hidden"
        style={{ background: "var(--bg-canvas)" }}
      >
        {peers.map((p, i) => {
          const angle = (i / peers.length) * Math.PI * 2 + activePeer * 0.4;
          const x = 50 + Math.cos(angle) * 28;
          const y = 50 + Math.sin(angle) * 18;
          return (
            <div
              key={p.name}
              className="absolute transition-all duration-700 ease-out"
              style={{ left: `${x}%`, top: `${y}%`, color: p.color }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 2 L12 6 L7 7.5 L6 12 Z" />
              </svg>
              <span className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface text-text-primary border border-border-subtle">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-text-secondary">
        4 collaborators / cursors synced via CRDT
      </div>
    </div>
  );
}

function WorkflowVignette() {
  const prefersReducedMotion = useReducedMotionPreference();
  const phases = ["Queued", "Planning", "Validating", "Streaming", "Done"];
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => setPhase((p) => (p + 1) % phases.length), 1200);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, phases.length]);

  const currentPhaseIndex = prefersReducedMotion ? phases.length - 1 : phase;
  const progress = ((currentPhaseIndex + 1) / phases.length) * 100;

  return (
    <div className="studio-panel rounded-2xl p-5 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-primary-dim)] text-accent-primary">
            <Workflow className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Durable workflow</div>
            <div className="text-xs text-text-muted">Trigger.dev / checkpointed</div>
          </div>
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border"
          style={{
            color: currentPhaseIndex === phases.length - 1 ? "var(--state-success)" : "var(--accent-primary)",
            borderColor:
              currentPhaseIndex === phases.length - 1 ? "var(--state-success)" : "var(--accent-primary)",
            background:
              currentPhaseIndex === phases.length - 1 ? "var(--state-success-dim)" : "var(--accent-primary-dim)",
          }}
        >
          {phases[currentPhaseIndex]}
        </span>
      </div>

      <div className="space-y-2">
        {phases.map((p, i) => (
          <div key={p} className="flex items-center gap-3 text-xs">
            <span
              className="h-2 w-2 rounded-full transition-colors"
              style={{
                background:
                  i < currentPhaseIndex
                    ? "var(--state-success)"
                    : i === currentPhaseIndex
                    ? "var(--accent-primary)"
                    : "var(--border-subtle)",
              }}
            />
            <span
              className={
                i === currentPhaseIndex
                  ? "text-text-primary font-medium"
                  : i < currentPhaseIndex
                  ? "text-text-muted line-through"
                  : "text-text-faint"
              }
            >
              {p}
            </span>
            {i === currentPhaseIndex && (
              <span className="ml-auto h-1 flex-1 max-w-[80px] rounded-full bg-elevated overflow-hidden">
                <span
                  className="block h-full bg-accent-primary"
                  style={{ width: `${progress}%`, transition: "width 1.1s ease-out" }}
                />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-text-secondary">
        Each phase is a checkpoint; retries resume here.
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Color */

const colorGroups: { name: string; tokens: { var: string; label: string; role: string }[] }[] = [
  {
    name: "Surfaces",
    tokens: [
      { var: "--bg-base", label: "App shell", role: "Primary background for the studio" },
      { var: "--bg-surface", label: "Surface", role: "Panels, cards, overlays" },
      { var: "--bg-elevated", label: "Elevated", role: "Hover, secondary surfaces" },
      { var: "--bg-subtle", label: "Subtle", role: "Inputs, dividers, code blocks" },
      { var: "--bg-canvas", label: "Canvas", role: "Deep work surface for diagrams" },
    ],
  },
  {
    name: "Text hierarchy",
    tokens: [
      { var: "--text-primary", label: "Primary", role: "Headlines and body" },
      { var: "--text-secondary", label: "Secondary", role: "Supporting copy" },
      { var: "--text-muted", label: "Muted", role: "Descriptions, hints" },
      { var: "--text-faint", label: "Faint", role: "Placeholders, tertiary info" },
    ],
  },
  {
    name: "Accents",
    tokens: [
      { var: "--accent-primary", label: "Primary blue", role: "Actions, focus, navigation" },
      { var: "--accent-ai", label: "AI violet", role: "Ghost AI generation states" },
      { var: "--accent-collab", label: "Collab teal", role: "Presence, shared actions" },
    ],
  },
  {
    name: "Semantic feedback",
    tokens: [
      { var: "--state-success", label: "Success", role: "Saved, completed, verified" },
      { var: "--state-warning", label: "Warning", role: "Attention, caution" },
      { var: "--state-error", label: "Error", role: "Failures, destructive" },
      { var: "--state-info", label: "Info", role: "Neutral information" },
    ],
  },
];

function ColorSection() {
  return (
    <div>
      <SectionTitle
        eyebrow="Color"
        title="Semantic tokens, not hex literals."
        desc="Every color in the app is a CSS custom property defined once in globals.css and surfaced through Tailwind. Components stay portable; theming stays centralized."
      />
      <div className="space-y-10">
        {colorGroups.map((group) => (
          <div key={group.name} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              {group.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.tokens.map((t) => (
                <ColorSwatch key={t.var} token={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorSwatch({
  token,
}: {
  token: { var: string; label: string; role: string };
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(token.var);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="group text-left studio-panel rounded-2xl p-4 flex items-start gap-3 hover:shadow-[var(--shadow-panel)] transition-shadow"
    >
      <div
        className="h-12 w-12 rounded-xl border border-border-default flex-shrink-0"
        style={{ backgroundColor: `var(${token.var})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium text-text-primary truncate">{token.label}</div>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-subtle text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "copied" : "copy"}
          </span>
        </div>
        <div className="font-mono text-xs text-text-secondary mt-0.5 truncate">{token.var}</div>
        <div className="text-xs text-text-muted mt-1.5 leading-snug">{token.role}</div>
      </div>
    </button>
  );
}

/* --------------------------------------------------------------- Motion */

const animations = [
  { name: "Fade in", className: "animate-fade-in", duration: "300ms", use: "Dialog appear, content load" },
  { name: "Slide top", className: "animate-slide-in-top", duration: "300ms", use: "Notifications, dropdowns" },
  { name: "Slide left", className: "animate-slide-in-left", duration: "300ms", use: "Sidebars, drawers" },
  { name: "Scale in", className: "animate-scale-in", duration: "250ms", use: "Popovers, tooltips" },
  { name: "Pulse ring", className: "animate-pulse-ring", duration: "2s loop", use: "Active indicators" },
  { name: "Ghost flow", className: "ghost-flow-dashed", duration: "1.6s loop", use: "AI-generated edges" },
];

function MotionSection() {
  return (
    <div>
      <SectionTitle
        eyebrow="Motion"
        title="Motion clarifies state. It never decorates."
        desc="Every animation is named for what it communicates, defined as a keyframe in globals.css, and disabled under prefers-reduced-motion."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {animations.map((a) => (
          <MotionCard key={a.name} anim={a} />
        ))}
      </div>
    </div>
  );
}

function MotionCard({
  anim,
}: {
  anim: { name: string; className: string; duration: string; use: string };
}) {
  const [key, setKey] = useState(0);
  const isLoop = anim.duration.includes("loop");

  return (
    <div
      onMouseEnter={() => !isLoop && setKey((k) => k + 1)}
      className="studio-panel rounded-2xl p-5 space-y-3 cursor-default"
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-medium">{anim.name}</div>
        <span className="font-mono text-[10px] text-text-muted">{anim.duration}</span>
      </div>
      <div className="h-24 rounded-xl bg-elevated flex items-center justify-center overflow-hidden">
        {anim.className === "ghost-flow-dashed" ? (
          <svg width="180" height="32" viewBox="0 0 180 32" fill="none">
            <path
              d="M8 16 L172 16"
              stroke="var(--accent-ai)"
              strokeWidth="2"
              className="ghost-flow-dashed"
            />
          </svg>
        ) : (
          <div
            key={key}
            className={`h-10 w-10 rounded-xl bg-accent-primary ${anim.className}`}
            style={
              anim.className === "animate-pulse-ring"
                ? { color: "var(--accent-primary)" }
                : undefined
            }
          />
        )}
      </div>
      <div className="text-xs text-text-muted">
        {isLoop ? "Continuous." : "Hover the card to replay."} {anim.use}.
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Components */

function ComponentsSection() {
  return (
    <div>
      <SectionTitle
        eyebrow="Components"
        title="Patterns, not pixels."
        desc="The same composable primitives the editor uses: buttons, panels, indicators, and feedback, so the showcase reflects the live product, not a parallel universe."
      />
      <div className="space-y-10">
        <ButtonsBlock />
        <FeedbackBlock />
        <PanelsBlock />
        <IndicatorsBlock />
      </div>
    </div>
  );
}

function ButtonsBlock() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Buttons</h3>
      <div className="studio-panel rounded-2xl p-6 flex flex-wrap gap-3">
        <PressButton className="bg-accent-primary text-text-inverse hover:bg-[var(--accent-primary-hover)]">
          Primary
        </PressButton>
        <PressButton className="bg-elevated text-text-primary hover:bg-subtle border border-border-default">
          Secondary
        </PressButton>
        <PressButton className="text-text-primary hover:bg-elevated">Tertiary</PressButton>
        <PressButton className="bg-state-error text-text-inverse hover:opacity-90">
          Destructive
        </PressButton>
        <span className="w-full mt-2 text-xs uppercase tracking-wider text-text-faint">With icons</span>
        <PressButton className="bg-accent-primary text-text-inverse hover:bg-[var(--accent-primary-hover)]">
          <Activity className="h-4 w-4" /> Generate
        </PressButton>
        <PressButton className="bg-accent-ai text-text-inverse hover:bg-[var(--accent-ai-hover)]">
          <Sparkles className="h-4 w-4" /> Ghost AI
        </PressButton>
        <PressButton className="bg-accent-collab text-text-inverse hover:bg-[var(--accent-collab-hover)]">
          <Users className="h-4 w-4" /> Share
        </PressButton>
      </div>
    </div>
  );
}

function PressButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        pressed ? "scale-[0.97]" : "scale-100"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function FeedbackBlock() {
  const items = [
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Success",
      msg: "Canvas saved to Vercel Blob",
      bg: "var(--state-success-dim)",
      fg: "var(--state-success)",
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "Warning",
      msg: "Schema drift detected; review before continuing",
      bg: "var(--state-warning-dim)",
      fg: "var(--state-warning)",
    },
    {
      icon: <Info className="h-5 w-5" />,
      label: "Info",
      msg: "Three collaborators are in this room",
      bg: "var(--state-info-dim)",
      fg: "var(--state-info)",
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      label: "Error",
      msg: "Trigger.dev task failed validation; retrying",
      bg: "var(--state-error-dim)",
      fg: "var(--state-error)",
    },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
        Feedback
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-2xl p-4 flex items-start gap-3 border"
            style={{ background: it.bg, borderColor: it.fg, color: it.fg }}
          >
            {it.icon}
            <div className="text-text-primary">
              <div className="font-semibold" style={{ color: it.fg }}>
                {it.label}
              </div>
              <div className="text-sm text-text-secondary">{it.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelsBlock() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Panels</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { cls: "studio-panel", title: "Studio panel", desc: "Default surface with soft shadow" },
          { cls: "studio-panel-strong", title: "Strong panel", desc: "Elevated with deeper shadow" },
          { cls: "canvas-panel", title: "Canvas panel", desc: "Frosted glass over the canvas" },
        ].map((p) => (
          <div key={p.title} className={`${p.cls} rounded-2xl p-5 space-y-2`}>
            <div className="font-medium">{p.title}</div>
            <div className="text-text-secondary text-sm">{p.desc}</div>
            <div className="pt-1.5 inline-flex items-center gap-1 text-accent-primary text-sm">
              Learn more
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndicatorsBlock() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
        AI &amp; presence indicators
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="studio-panel rounded-2xl p-5 space-y-3">
          <div className="text-xs text-text-muted">AI generating</div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--accent-ai-dim)" }}
          >
            <span className="ghost-pulse-dot h-2 w-2 rounded-full bg-accent-ai" />
            <span className="text-sm font-medium text-accent-ai">Designing architecture...</span>
          </div>
        </div>
        <div className="studio-panel rounded-2xl p-5 space-y-3">
          <div className="text-xs text-text-muted">Autosaved</div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--state-success-dim)" }}
          >
            <span className="h-2 w-2 rounded-full bg-state-success" />
            <span className="text-sm font-medium text-state-success">All changes saved</span>
          </div>
        </div>
        <div className="studio-panel rounded-2xl p-5 space-y-3">
          <div className="text-xs text-text-muted">Live presence</div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--accent-collab-dim)" }}
          >
            <span className="h-2 w-2 rounded-full bg-accent-collab animate-pulse" />
            <span className="text-sm font-medium text-accent-collab">3 collaborators in room</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Stack */

function StackSection() {
  const signals = [
    {
      icon: <Cpu className="h-4 w-4" />,
      title: "Durable AI workflows",
      desc: "Claude inside Trigger.dev tasks with retries, checkpoints, and progress streaming. Never inside request handlers.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      title: "Schema-validated outputs",
      desc: "Zod schemas guard every model response before it touches Liveblocks or PostgreSQL.",
    },
    {
      icon: <GitBranch className="h-4 w-4" />,
      title: "Real-time CRDT canvas",
      desc: "Liveblocks room with typed presence, undo/redo, and conflict-free sync via React Flow.",
    },
    {
      icon: <Database className="h-4 w-4" />,
      title: "Production storage",
      desc: "Prisma + PostgreSQL for relational state, Vercel Blob for canvas snapshots and generated specs.",
    },
    {
      icon: <Layers className="h-4 w-4" />,
      title: "Token-driven design",
      desc: "Every color, motion, and shape sourced from CSS variables. No hex literals in components.",
    },
    {
      icon: <Code2 className="h-4 w-4" />,
      title: "Boundary discipline",
      desc: "Server Components by default; client only for interactivity. Route protection in proxy.ts.",
    },
  ];
  return (
    <div>
      <SectionTitle
        eyebrow="Stack"
        title="What this is actually built from."
        desc="The signals a recruiter or developer should see in the file tree before they read a line of code."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {signals.map((s) => (
          <div
            key={s.title}
            className="studio-panel rounded-2xl p-5 space-y-2 hover:shadow-[var(--shadow-panel)] transition-shadow"
          >
            <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--accent-primary-dim)] text-accent-primary">
              {s.icon}
            </div>
            <div className="font-medium text-text-primary">{s.title}</div>
            <div className="text-sm text-text-secondary leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Footer */

function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Ghost AI</span> / a portfolio piece for
          full-stack &amp; applied AI engineering.
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/editor"
            className="inline-flex items-center gap-1 text-accent-primary hover:underline"
          >
            Open editor <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
