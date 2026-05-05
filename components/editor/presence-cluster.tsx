"use client";

import { UserButton } from "@clerk/nextjs";

export interface CollaboratorInfo {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  cursorColor: string;
  thinking?: boolean;
  isGhostAi?: boolean;
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

function GhostAiAvatar({
  collaborator,
  zIndex,
}: {
  collaborator: CollaboratorInfo;
  zIndex: number;
}) {
  const { thinking, cursorColor } = collaborator;
  return (
    <div
      role="img"
      aria-label="Ghost AI"
      title="Ghost AI"
      className="relative flex shrink-0 items-center justify-center rounded-full select-none"
      style={{
        width: 32,
        height: 32,
        zIndex,
        marginLeft: zIndex === 0 ? 0 : -8,
        background: "var(--accent-ai-dim)",
        boxShadow: thinking
          ? `0 0 0 2px var(--bg-surface), 0 0 0 3.5px ${cursorColor}`
          : `0 0 0 2px var(--bg-surface), 0 0 0 3.5px var(--border-subtle)`,
      }}
    >
      {/* Ghost AI icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: "var(--accent-ai-text)" }}
      >
        <rect x="2" y="5" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="5.5" cy="9" r="1" fill="currentColor" />
        <circle cx="10.5" cy="9" r="1" fill="currentColor" />
        <path d="M8 2v3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="8" cy="1.5" r="0.75" fill="currentColor" />
      </svg>

      {/* Thinking ring: animated dashed border overlay */}
      {thinking && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            border: "1.5px dashed var(--accent-ai-text)",
            opacity: 0.7,
            animation: "ghost-ai-spin 1.5s linear infinite",
          }}
        />
      )}
    </div>
  );
}

function CollaboratorAvatar({ collaborator, zIndex }: CollaboratorAvatarProps) {
  if (collaborator.isGhostAi) {
    return <GhostAiAvatar collaborator={collaborator} zIndex={zIndex} />;
  }

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

  const hasGhostAiThinking = collaborators.some(
    (c) => c.isGhostAi && c.thinking,
  );

  return (
    <>
      {/* Keyframe for Ghost AI thinking ring */}
      {hasGhostAiThinking && (
        <style>{`@keyframes ghost-ai-spin { to { transform: rotate(360deg); } }`}</style>
      )}
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

        {/* Vertical divider */}
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
    </>
  );
}
