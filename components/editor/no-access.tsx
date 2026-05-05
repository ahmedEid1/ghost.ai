"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoAccessProps {
  projectId: string;
}

export function NoAccess({ projectId }: NoAccessProps) {
  const router = useRouter();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-base px-4"
      data-project-id={projectId}
    >
      <div className="studio-panel-strong relative flex max-w-md flex-col items-center gap-6 overflow-hidden rounded-3xl px-8 py-9 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-state-error/10">
          <span
            aria-hidden
            className="ghost-pulse-dot absolute inset-0 rounded-2xl bg-state-error/15"
          />
          <ShieldOff
            className="relative h-7 w-7"
            style={{ color: "var(--state-error)" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-state-error">
            403 Forbidden
          </p>
          <h1 className="text-2xl font-semibold text-text-primary">
            Access restricted
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            You don&apos;t have permission to view this project. Ask the owner
            for access, or head back to your projects.
          </p>
        </div>

        <div className="h-px w-full bg-border-default" />

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/editor"
            className={cn(buttonVariants({ variant: "default" }), "gap-2")}
          >
            <Home className="h-4 w-4" />
            My Projects
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-2 text-text-muted hover:text-text-primary"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
