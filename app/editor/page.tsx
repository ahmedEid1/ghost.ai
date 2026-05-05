"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Copy,
  FileCode2,
  FolderOpen,
  GitBranch,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatBadge from "@/components/ui/stat-badge";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context";
import { type Project, type ProjectStatus } from "@/lib/types";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  DRAFT: "border-border-default bg-elevated text-text-muted",
  ACTIVE: "border-state-success/20 bg-state-success/10 text-state-success",
  ARCHIVED: "border-border-default bg-subtle text-text-faint",
};

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onShare: (p: Project) => void;
  onDuplicate: (p: Project) => void;
}) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  async function handleDuplicate() {
    setIsDuplicating(true);
    try {
      await onDuplicate(project);
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <div className="group relative flex min-h-[172px] flex-col overflow-hidden rounded-2xl border border-border-default bg-surface p-4 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-panel)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent-primary transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[project.status]}`}
        >
          {STATUS_LABELS[project.status]}
        </span>
        {!project.isOwner && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-collab-dim px-2 py-0.5 text-[11px] font-medium text-accent-collab">
            <Users className="h-3 w-3" />
            Shared
          </span>
        )}
      </div>

      <Link
        href={`/editor/${project.id}`}
        className="mb-1 block truncate text-base font-semibold text-text-primary transition-colors hover:text-accent-primary"
      >
        {project.name}
      </Link>

      {project.description ? (
        <p className="line-clamp-2 flex-1 text-xs leading-6 text-text-muted">
          {project.description}
        </p>
      ) : (
        <p className="flex-1 text-xs italic leading-6 text-text-faint">
          No description yet
        </p>
      )}

      <div className="mt-4 flex items-center gap-1">
        <Link
          href={`/editor/${project.id}`}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--accent-primary-hover)]"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Open
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-muted hover:bg-elevated hover:text-text-primary"
          onClick={handleDuplicate}
          disabled={isDuplicating}
          title="Duplicate project"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>

        {project.isOwner && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:bg-elevated hover:text-text-primary"
              onClick={() => onShare(project)}
              title="Share project"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:bg-elevated hover:text-text-primary"
              onClick={() => onEdit(project)}
              title="Edit project"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:bg-elevated hover:text-state-error"
              onClick={() => onDelete(project)}
              title="Delete project"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "primary" | "ai" | "collab";
}) {
  return (
    <StatBadge
      icon={icon}
      label={label}
      value={Number(value)}
      tone={tone}
      animateCount
      pulseOnUpdate
    />
  );
}

function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[172px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface/70 text-text-muted shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-primary hover:bg-accent-primary-dim hover:text-accent-primary"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-elevated">
        <Plus className="h-5 w-5" />
      </div>
      <span className="text-sm font-semibold">New project</span>
    </button>
  );
}

export default function EditorPage() {
  const {
    openCreateDialog,
    projects,
    openEditDialog,
    openDeleteDialog,
    openShareDialog,
    duplicateProject,
  } = useProjectDialogsContext();

  const myProjects = projects.filter((p) => p.isOwner);
  const sharedProjects = projects.filter((p) => !p.isOwner);
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;

  if (projects.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="studio-panel-strong relative flex w-full max-w-2xl flex-col items-center gap-7 overflow-hidden rounded-3xl px-8 py-10 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary-dim">
            <span
              aria-hidden
              className="ghost-pulse-dot absolute inset-0 rounded-2xl bg-accent-primary/20"
            />
            <GitBranch className="relative h-7 w-7 text-accent-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-primary">
              Architecture studio
            </p>
            <h1 className="text-2xl font-semibold text-text-primary">
              Start an architecture workspace
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-text-muted">
              Create a project, prompt Ghost AI, and turn the shared canvas into a technical spec.
            </p>
          </div>
          <Button size="lg" onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="studio-panel-strong rounded-3xl p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-primary">
                  Architecture studio
                </p>
                <h1 className="text-2xl font-semibold text-text-primary">
                  Projects
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
                  Open a workspace, generate system designs with Ghost AI, collaborate in real time, and export specs.
                </p>
              </div>
              <Button onClick={openCreateDialog} className="gap-2 self-start sm:self-auto">
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={FolderOpen} label="projects" value={`${projects.length}`} tone="primary" />
            <StatCard icon={Bot} label="AI-ready" value={`${activeCount}`} tone="ai" />
            <StatCard icon={Users} label="shared" value={`${sharedProjects.length}`} tone="collab" />
          </div>
        </section>

        {myProjects.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-faint">
                My projects
              </h2>
              <span className="text-xs text-text-muted">{myProjects.length} owned</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {myProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onShare={openShareDialog}
                  onDuplicate={duplicateProject}
                />
              ))}
              <NewProjectCard onClick={openCreateDialog} />
            </div>
          </section>
        )}

        {sharedProjects.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-faint">
                Shared with me
              </h2>
              <span className="text-xs text-text-muted">{sharedProjects.length} shared</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sharedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onShare={openShareDialog}
                  onDuplicate={duplicateProject}
                />
              ))}
            </div>
          </section>
        )}

        {myProjects.length === 0 && sharedProjects.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-accent-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-faint">
                Start your own workspace
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <NewProjectCard onClick={openCreateDialog} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
