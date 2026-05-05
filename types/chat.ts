import type { AiChatFeedMessageData } from "@/liveblocks.config";

export const CHAT_MAX_CONTENT_LENGTH = 2000;

export function parseChatMessage(data: unknown): AiChatFeedMessageData | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;

  if (d.kind !== "chat-message") return null;
  if (d.role !== "user" && d.role !== "assistant") return null;
  if (typeof d.senderId !== "string" || !d.senderId) return null;
  if (typeof d.senderName !== "string" || !d.senderName) return null;
  if (typeof d.content !== "string") return null;

  const content = d.content.trim();
  if (!content || content.length > CHAT_MAX_CONTENT_LENGTH) return null;

  const senderAvatarUrl =
    typeof d.senderAvatarUrl === "string" ? d.senderAvatarUrl : null;

  return {
    kind: "chat-message",
    role: d.role as "user" | "assistant",
    senderId: d.senderId,
    senderName: d.senderName,
    senderAvatarUrl,
    content,
  };
}
