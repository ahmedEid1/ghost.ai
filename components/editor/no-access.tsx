"use client";

import Link from "next/link";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoAccessProps {
  projectId: string;
}

export function NoAccess({ projectId: _ }: NoAccessProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-base px-4">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        {/* Icon with glow */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-elevated">
          <div
            className="absolute inset-0 rounded-3xl opacity-20"
            style={{ background: "radial-gradient(circle, var(--state-error) 0%, transparent 70%)" }}
          />
          <ShieldOff
            className="h-10 w-10"
            style={{ color: "var(--state-error)" }}
          />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Access Restricted
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            You don&apos;t have permission to view this project. Contact the
            project owner to request access, or go back to your projects.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border-default" />

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Link
            href="/editor"
            className={cn(buttonVariants({ variant: "default" }), "gap-2")}
          >
            <Home className="h-4 w-4" />
            My Projects
          </Link>
          <Link
            href="/editor"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-2 text-text-muted hover:text-text-primary"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
