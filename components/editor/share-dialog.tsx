"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  UserPlus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Collaborator {
  id: string;
  email: string;
  displayName: string;
  imageUrl: string | null;
}

interface Owner {
  id: string;
  displayName: string;
  imageUrl: string | null;
  email: string | null;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  isOwner,
}: ShareDialogProps) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError((data as { error?: string }).error ?? "Failed to load members");
        return;
      }
      const data = await res.json();
      setOwner(data.owner);
      setCollaborators(data.collaborators);
    } catch {
      setFetchError("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void fetchCollaborators();
      setInviteEmail("");
      setInviteError(null);
      setInviteSuccess(false);
      setCopied(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, fetchCollaborators]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError((data as { error?: string }).error ?? "Failed to invite");
        return;
      }
      setCollaborators((prev) => [...prev, data as Collaborator]);
      setInviteEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch {
      setInviteError("Failed to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    setRemovingId(collaboratorId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      );
      if (!res.ok) return;
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    } finally {
      setRemovingId(null);
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-md rounded-3xl border border-border-default bg-surface shadow-[var(--shadow-panel)]"
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <Users
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--accent-primary)" }}
              />
              <span className="truncate">Share &ldquo;{projectName}&rdquo;</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 shrink-0 text-text-muted hover:text-text-primary"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Copy link */}
        <div className="flex items-center gap-2 rounded-xl border border-border-default bg-surface px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-text-muted">
            /editor/{projectId}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 shrink-0 gap-1.5 px-2 text-xs font-medium transition-colors ${
              copied
                ? "text-state-success"
                : "text-text-muted hover:text-text-primary"
            }`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-200" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        {/* Invite (owner only) */}
        {isOwner && (
          <div className="space-y-2">
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address to invite..."
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteError) setInviteError(null);
                }}
                className="flex-1 text-sm"
                disabled={isInviting}
                autoComplete="off"
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={isInviting || !inviteEmail.trim()}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {isInviting ? "Inviting..." : "Invite"}
              </Button>
            </form>
            {inviteError && (
              <p
                className="text-xs"
                style={{ color: "var(--state-error)" }}
              >
                {inviteError}
              </p>
            )}
            {inviteSuccess && (
              <p
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--state-success)" }}
              >
                <Check className="h-3 w-3" />
                Collaborator added successfully
              </p>
            )}
          </div>
        )}

        {/* Members list */}
        <div className="space-y-2">
          <p className="px-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            {isLoading
              ? "Members"
              : `Members - ${
                  collaborators.length + (owner ? 1 : 0)
                }`}
          </p>

          {isLoading ? (
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-2 py-2"
                >
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-subtle" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 animate-pulse rounded bg-subtle" />
                    <div className="h-2.5 w-36 animate-pulse rounded bg-subtle" />
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded-full bg-subtle" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <p
              className="rounded-xl px-2 py-3 text-xs"
              style={{ color: "var(--state-error)" }}
            >
              {fetchError}
            </p>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-0.5">
                {owner && (
                  <MemberRow
                    displayName={owner.displayName}
                    email={owner.email ?? ""}
                    imageUrl={owner.imageUrl}
                    role="Owner"
                    getInitials={getInitials}
                  />
                )}
                {collaborators.map((c) => (
                  <MemberRow
                    key={c.id}
                    displayName={c.displayName}
                    email={c.email}
                    imageUrl={c.imageUrl}
                    role="Collaborator"
                    getInitials={getInitials}
                    onRemove={isOwner ? () => handleRemove(c.id) : undefined}
                    isRemoving={removingId === c.id}
                  />
                ))}
                {collaborators.length === 0 && !isLoading && (
                  <p className="py-4 text-center text-xs text-text-muted">
                    {isOwner
                      ? "No collaborators yet. Invite someone above."
                      : "Only you have access to this project."}
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MemberRowProps {
  displayName: string;
  email: string;
  imageUrl: string | null;
  role: "Owner" | "Collaborator";
  getInitials: (name: string) => string;
  onRemove?: () => void;
  isRemoving?: boolean;
}

function MemberRow({
  displayName,
  email,
  imageUrl,
  role,
  getInitials,
  onRemove,
  isRemoving,
}: MemberRowProps) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-subtle">
      <Avatar size="default">
        {imageUrl && <AvatarImage src={imageUrl} alt={displayName} />}
        <AvatarFallback className="bg-elevated text-xs text-text-secondary">
          {getInitials(displayName || email)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {displayName}
        </p>
        {email && displayName !== email && (
          <p className="truncate text-xs text-text-muted">{email}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={`inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium ${
            role === "Owner"
              ? "border-border-subtle text-text-secondary"
              : "border-border-default text-text-muted"
          }`}
        >
          {role}
        </span>

        {onRemove && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-text-muted opacity-0 transition-opacity hover:text-state-error group-hover:opacity-100 focus-visible:opacity-100"
            onClick={onRemove}
            disabled={isRemoving}
            aria-label={`Remove ${displayName}`}
          >
            {isRemoving ? (
              <span
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
