import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Ghost,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

const ENTRY_SIGNALS = [
  {
    title: "Durable AI workflows",
    body: "Trigger.dev runs Claude outside request handlers with retries, progress, and checkpoints.",
    icon: Workflow,
  },
  {
    title: "Schema-validated output",
    body: "Every AI response is parsed against a Zod schema before it can mutate the canvas or database.",
    icon: CheckCircle2,
  },
  {
    title: "Real-time collaboration",
    body: "Liveblocks presence, cursors, and canvas sync keep the editor honest under concurrent edits.",
    icon: Users,
  },
  {
    title: "Token-driven UI",
    body: "The studio palette, motion, and shape come from CSS variables surfaced through Tailwind.",
    icon: Layers,
  },
] as const;

const DEMO_STEPS = [
  "Open the public showcase",
  "Read the design system contract",
  "Sign in to enter the editor",
  "Describe a system and generate a spec",
] as const;

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/editor");
  }

  return (
    <main className="min-h-screen bg-base text-text-primary">
      <TopBar />
      <Hero />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:py-14">
        <div className="studio-panel-strong rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-accent-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Entry points
          </div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
            One public surface for recruiters, one authenticated workspace for the product.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            Ghost AI now opens as a public landing page. Recruiters can inspect the design language immediately, while signed-in users are fast-pathed to the editor.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/ui-showcase"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-[var(--accent-primary-hover)]"
            >
              Open showcase
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-elevated"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {DEMO_STEPS.map((step, index) => (
              <div key={step} className="rounded-2xl border border-border-default bg-surface p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-faint">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 text-sm font-medium text-text-primary">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {ENTRY_SIGNALS.map((signal) => {
            const Icon = signal.icon;
            return (
              <article
                key={signal.title}
                className="studio-panel rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-primary-dim text-accent-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-text-primary">{signal.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-text-primary">{signal.body}</p>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="studio-panel-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-accent-ai">
              <Sparkles className="h-3.5 w-3.5" />
              Stack preview
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StackTile label="Next.js 16" text="Server-first routes and protected editor shells." />
              <StackTile label="Liveblocks" text="Presence, chat, and CRDT canvas state." />
              <StackTile label="Trigger.dev" text="Durable AI workflows with retries and checkpoints." />
              <StackTile label="Vercel Blob" text="Canvas snapshots and generated specs." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <div className="canvas-panel rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-accent-primary">
                Recruiter path
              </div>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                The public page is a map of the product, not a placeholder.
              </h2>
            </div>
            <Link
              href="/ui-showcase"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent-primary transition-colors hover:text-[var(--accent-primary-hover)]"
            >
              View the design system
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Footnote title="Surface" text="Light shell, deep canvas, no decorative marketing chrome." />
            <Footnote title="Motion" text="Named animations that clarify state instead of decorating it." />
            <Footnote title="Access" text="Public showcase route, protected editor, server-side auth checks." />
          </div>
        </div>
      </section>
    </main>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent-primary text-text-inverse">
            <span className="absolute inset-0 rounded-md bg-accent-primary animate-pulse-ring" />
            <Ghost className="relative h-3.5 w-3.5" />
          </span>
          Ghost AI
          <span className="hidden font-normal text-text-faint sm:inline">/ system design studio</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/ui-showcase"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
          >
            Showcase
          </Link>
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-primary px-3.5 py-1.5 text-sm font-medium text-text-inverse transition-colors hover:bg-[var(--accent-primary-hover)]"
          >
            Open editor
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--canvas-grid-default) 1px, transparent 1px), linear-gradient(to bottom, var(--canvas-grid-default) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/70 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
            <span className="ghost-pulse-dot h-1.5 w-1.5 rounded-full bg-accent-ai" />
            Public landing / public showcase / protected editor
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-text-primary sm:text-5xl lg:text-6xl lg:leading-[1.04]">
            A real-time, AI-native system design studio, presented like a serious product.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
            Ghost AI turns plain-language system ideas into validated diagrams and structured specs.
            The public entry now shows the design language up front so the product reads correctly before sign-in.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/ui-showcase"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-[var(--accent-primary-hover)]"
            >
              Open showcase
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-elevated"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-10 lg:mt-0">
          <div className="studio-panel-strong relative overflow-hidden rounded-3xl p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-accent-primary">Demo path</div>
                <div className="mt-2 text-lg font-semibold">Public entry to product loop</div>
              </div>
              <div className="rounded-full bg-accent-primary-dim px-3 py-1 text-xs font-semibold text-accent-primary">
                60 seconds
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {DEMO_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-border-default bg-surface px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-elevated text-xs font-semibold text-text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 text-sm font-medium text-text-primary">{step}</div>
                  <ArrowUpRight className="h-4 w-4 text-text-faint" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StackTile({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface p-4">
      <div className="text-sm font-semibold text-text-primary">{label}</div>
      <p className="mt-1 text-xs leading-5 text-text-secondary">{text}</p>
    </div>
  );
}

function Footnote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface p-4">
      <div className="text-xs font-mono uppercase tracking-[0.18em] text-text-faint">{title}</div>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
    </div>
  );
}
