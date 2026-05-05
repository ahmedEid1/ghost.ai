"use client";

import { UserButton } from "@clerk/nextjs";

export interface CollaboratorInfo {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  cursorColor: string;
}

interface CollaboratorAvatarProps {
  collaborator: CollaboratorInfo;
  zIndex: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

function CollaboratorAvatar({ collaborator, zIndex }: CollaboratorAvatarProps) {
  const { displayName, avatarUrl, cursorColor } = collaborator;
  const initials = getInitials(displayName);

  return (
    <div
      role="img"
      aria-label={displayName}
      title={displayName}
      className="relative flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold select-none"
      style={{
        width: 32,
        height: 32,
        zIndex,
        marginLeft: zIndex === 0 ? 0 : -8,
        background: avatarUrl ? "transparent" : cursorColor,
        color: "var(--text-inverse)",
        boxShadow: `0 0 0 2px var(--bg-surface), 0 0 0 3.5px ${cursorColor}`,
      }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

interface OverflowChipProps {
  count: number;
  zIndex: number;
}

function OverflowChip({ count, zIndex }: OverflowChipProps) {
  return (
    <div
      aria-label={`${count} more collaborators`}
      title={`+${count} more`}
      className="relative flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold select-none"
      style={{
        width: 32,
        height: 32,
        zIndex,
        marginLeft: -8,
        background: "var(--bg-elevated)",
        color: "var(--text-secondary)",
        boxShadow: "0 0 0 2px var(--bg-surface)",
      }}
    >
      +{count}
    </div>
  );
}

const MAX_VISIBLE = 5;

interface PresenceClusterProps {
  collaborators: CollaboratorInfo[];
}

export function PresenceCluster({ collaborators }: PresenceClusterProps) {
  const visible = collaborators.slice(0, MAX_VISIBLE);
  const overflow = collaborators.length - MAX_VISIBLE;

  return (
    <div
      role="group"
      aria-label="Room participants"
      className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2"
      style={{ pointerEvents: "auto" }}
    >
      {/* Collaborator avatar stack */}
      {visible.length > 0 && (
        <div className="flex items-center">
          {visible.map((c, i) => (
            <CollaboratorAvatar key={c.id} collaborator={c} zIndex={i} />
          ))}
          {overflow > 0 && (
            <OverflowChip count={overflow} zIndex={visible.length} />
          )}
        </div>
      )}

      {/* Vertical divider — only when collaborators exist */}
      {collaborators.length > 0 && (
        <div
          className="h-6 w-px shrink-0 rounded-full"
          style={{ background: "var(--border-subtle)" }}
          aria-hidden
        />
      )}

      {/* Current user via Clerk UserButton */}
      <UserButton />
    </div>
  );
}
