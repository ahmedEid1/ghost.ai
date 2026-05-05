"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Project, type ProjectStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ProjectStatus; label: string; hint: string }[] = [
  { value: "DRAFT", label: "Draft", hint: "Idea-stage, hidden from collaborators by default" },
  { value: "ACTIVE", label: "Active", hint: "In progress and ready for AI generation" },
  { value: "ARCHIVED", label: "Archived", hint: "Read-only and parked" },
];

const DESCRIPTION_MAX = 500;

function StatusSegmented({
  value,
  onChange,
  disabled,
}: {
  value: ProjectStatus;
  onChange: (next: ProjectStatus) => void;
  disabled?: boolean;
}) {
  const activeHint = STATUS_OPTIONS.find((o) => o.value === value)?.hint;
  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="radiogroup"
        aria-label="Project status"
        className="grid grid-cols-3 gap-1 rounded-xl border border-border-default bg-elevated p-1"
      >
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={
                "rounded-lg px-2 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 " +
                (isSelected
                  ? "bg-surface text-text-primary shadow-[var(--shadow-soft)]"
                  : "text-text-muted hover:text-text-primary")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {activeHint && (
        <p className="px-0.5 text-xs text-text-muted">{activeHint}</p>
      )}
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint"
    >
      {children}
    </label>
  );
}

interface CreateProjectDialogProps {
  open: boolean;
  projectName: string;
  projectDescription: string;
  projectStatus: ProjectStatus;
  slug: string;
  isSubmitting: boolean;
  error: string | null;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  onProjectStatusChange: (status: ProjectStatus) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function CreateProjectDialog({
  open,
  projectName,
  projectDescription,
  projectStatus,
  slug,
  isSubmitting,
  error,
  onProjectNameChange,
  onProjectDescriptionChange,
  onProjectStatusChange,
  onCreate,
  onClose,
}: CreateProjectDialogProps) {
  const canSubmit = !!projectName.trim() && !!slug && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="rounded-3xl border border-border-default bg-surface shadow-[var(--shadow-panel)] sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Create project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Give your architecture workspace a name. Description and status are optional.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="create-project-name">Name</FieldLabel>
            <Input
              id="create-project-name"
              autoFocus
              placeholder="e.g. Realtime payments platform"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) onCreate();
              }}
              disabled={isSubmitting}
              className="bg-surface text-text-primary"
            />
            {projectName.trim() && !slug ? (
              <p className="px-0.5 text-xs text-state-error">
                Name must contain at least one letter or number.
              </p>
            ) : (
              <p className="px-0.5 text-xs text-text-muted">
                Room slug:{" "}
                <span className="font-mono text-text-secondary">{slug || "—"}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="create-project-description">Description</FieldLabel>
            <Textarea
              id="create-project-description"
              placeholder="What problem does this system solve?"
              value={projectDescription}
              onChange={(e) =>
                onProjectDescriptionChange(e.target.value.slice(0, DESCRIPTION_MAX))
              }
              disabled={isSubmitting}
              rows={3}
              className="bg-surface text-text-primary"
            />
            <p className="px-0.5 text-right text-[11px] text-text-faint">
              {projectDescription.length} / {DESCRIPTION_MAX}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Status</FieldLabel>
            <StatusSegmented
              value={projectStatus}
              onChange={onProjectStatusChange}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="px-0.5 text-xs text-state-error">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
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

interface EditProjectDialogProps {
  open: boolean;
  project: Project | null;
  projectName: string;
  projectDescription: string;
  projectStatus: ProjectStatus;
  slug: string;
  isSubmitting: boolean;
  error: string | null;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  onProjectStatusChange: (status: ProjectStatus) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditProjectDialog({
  open,
  project,
  projectName,
  projectDescription,
  projectStatus,
  slug,
  isSubmitting,
  error,
  onProjectNameChange,
  onProjectDescriptionChange,
  onProjectStatusChange,
  onSave,
  onClose,
}: EditProjectDialogProps) {
  const trimmedName = projectName.trim();
  const trimmedDescription = projectDescription.trim();

  const isUnchanged =
    !!project &&
    trimmedName === project.name &&
    trimmedDescription === (project.description ?? "") &&
    projectStatus === project.status;

  const canSubmit =
    !!trimmedName && !!slug && !isUnchanged && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="rounded-3xl border border-border-default bg-surface shadow-[var(--shadow-panel)] sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Edit project</DialogTitle>
          {project && (
            <DialogDescription className="text-text-muted">
              Update name, description, or status. Changes apply immediately.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="edit-project-name">Name</FieldLabel>
            <Input
              id="edit-project-name"
              autoFocus
              placeholder="Project name"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) onSave();
              }}
              disabled={isSubmitting}
              className="bg-surface text-text-primary"
            />
            {trimmedName && !slug ? (
              <p className="px-0.5 text-xs text-state-error">
                Name must contain at least one letter or number.
              </p>
            ) : (
              <p className="px-0.5 text-xs text-text-muted">
                Room slug:{" "}
                <span className="font-mono text-text-secondary">{slug || "—"}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="edit-project-description">Description</FieldLabel>
            <Textarea
              id="edit-project-description"
              placeholder="What problem does this system solve?"
              value={projectDescription}
              onChange={(e) =>
                onProjectDescriptionChange(e.target.value.slice(0, DESCRIPTION_MAX))
              }
              disabled={isSubmitting}
              rows={3}
              className="bg-surface text-text-primary"
            />
            <p className="px-0.5 text-right text-[11px] text-text-faint">
              {projectDescription.length} / {DESCRIPTION_MAX}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Status</FieldLabel>
            <StatusSegmented
              value={projectStatus}
              onChange={onProjectStatusChange}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="px-0.5 text-xs text-state-error">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="rounded-3xl border border-border-default bg-surface shadow-[var(--shadow-panel)] sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">Delete project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Are you sure you want to delete{" "}
            <span className="font-medium text-text-primary">
              {project?.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-xs text-state-error">{error}</p>}
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
                Deleting...
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
