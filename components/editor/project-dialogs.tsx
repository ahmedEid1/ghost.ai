"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Project } from "@/lib/types";

// ── Create Project Dialog ─────────────────────────────────────────────────────

interface CreateProjectDialogProps {
  open: boolean;
  projectName: string;
  slug: string;
  isSubmitting: boolean;
  error: string | null;
  onProjectNameChange: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function CreateProjectDialog({
  open,
  projectName,
  slug,
  isSubmitting,
  error,
  onProjectNameChange,
  onCreate,
  onClose,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-elevated border border-border-default rounded-3xl sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Create Project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Name your project. You can rename it at any time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Input
            autoFocus
            placeholder="Project name"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && projectName.trim() && slug && !isSubmitting)
                onCreate();
            }}
            disabled={isSubmitting}
            className="bg-surface text-text-primary"
          />
          {error ? (
            <p className="text-xs text-state-error px-0.5">{error}</p>
          ) : projectName.trim() && !slug ? (
            <p className="text-xs text-state-error px-0.5">
              Name must contain at least one letter or number.
            </p>
          ) : (
            <p className="text-xs text-text-muted px-0.5">
              Room ID preview:{" "}
              <span className="font-mono text-text-secondary">
                {slug || "—"}
              </span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={!projectName.trim() || !slug || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Rename Project Dialog ─────────────────────────────────────────────────────

interface RenameProjectDialogProps {
  open: boolean;
  project: Project | null;
  projectName: string;
  slug: string;
  isSubmitting: boolean;
  error: string | null;
  onProjectNameChange: (name: string) => void;
  onRename: () => void;
  onClose: () => void;
}

export function RenameProjectDialog({
  open,
  project,
  projectName,
  slug,
  isSubmitting,
  error,
  onProjectNameChange,
  onRename,
  onClose,
}: RenameProjectDialogProps) {
  const isUnchanged = projectName.trim() === project?.name;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-elevated border border-border-default rounded-3xl sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Rename Project</DialogTitle>
          {project && (
            <DialogDescription className="text-text-muted">
              Current name:{" "}
              <span className="text-text-secondary font-medium">{project.name}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Input
            autoFocus
            placeholder="Project name"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                projectName.trim() &&
                slug &&
                !isUnchanged &&
                !isSubmitting
              )
                onRename();
            }}
            disabled={isSubmitting}
            className="bg-surface text-text-primary"
          />
          {error ? (
            <p className="text-xs text-state-error px-0.5">{error}</p>
          ) : projectName.trim() && !slug ? (
            <p className="text-xs text-state-error px-0.5">
              Name must contain at least one letter or number.
            </p>
          ) : (
            <p className="text-xs text-text-muted px-0.5">
              New slug:{" "}
              <span className="font-mono text-text-secondary">
                {slug || "—"}
              </span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={onRename}
            disabled={!projectName.trim() || !slug || isUnchanged || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Renaming…
              </>
            ) : (
              "Rename"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Project Dialog ─────────────────────────────────────────────────────

interface DeleteProjectDialogProps {
  open: boolean;
  project: Project | null;
  isSubmitting: boolean;
  error: string | null;
  onDelete: () => void;
  onClose: () => void;
}

export function DeleteProjectDialog({
  open,
  project,
  isSubmitting,
  error,
  onDelete,
  onClose,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-elevated border border-border-default rounded-3xl sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Delete Project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Are you sure you want to delete{" "}
            <span className="text-text-primary font-medium">
              {project?.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-xs text-state-error">{error}</p>
        )}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
