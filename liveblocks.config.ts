// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data

export type AiStatusEvent = {
  type: "AI_STATUS";
  projectId: string;
  runId: string;
  phase:
    | "started"
    | "reading-canvas"
    | "planning"
    | "validating"
    | "applying"
    | "complete"
    | "error";
  message: string;
  nodeCount?: number;
  edgeCount?: number;
  at: string;
};

export interface AiChatFeedMetadata {
  kind: "room-chat";
  projectId: string;
}

export interface AiChatFeedMessageData {
  kind: "chat-message";
  role: "user" | "assistant";
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
}

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {};

    UserMeta: {
      id: string;
      info: {
        displayName: string;
        avatarUrl: string;
        cursorColor: string;
      };
    };

    RoomEvent: AiStatusEvent;

    ThreadMetadata: {};

    RoomInfo: {};

    FeedMetadata: AiChatFeedMetadata;

    FeedMessageData: AiChatFeedMessageData;
  }
}

export {};
