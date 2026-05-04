import { auth } from "@clerk/nextjs/server";
import { liveblocks, getCursorColor } from "@/lib/liveblocks";
import { hasAccessToProject } from "@/lib/project-access";

interface LiveblocksAuthBody {
  userId: string;
  roomId: string;
  displayName: string;
  avatarUrl: string;
}

function isValidBody(body: unknown): body is LiveblocksAuthBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.userId === "string" &&
    b.userId.trim() !== "" &&
    typeof b.roomId === "string" &&
    b.roomId.trim() !== "" &&
    typeof b.displayName === "string" &&
    b.displayName.trim() !== "" &&
    typeof b.avatarUrl === "string"
  );
}

export async function POST(request: Request): Promise<Response> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return Response.json(
      { error: "Missing or invalid fields: userId, roomId, displayName are required" },
      { status: 400 }
    );
  }

  const { userId, roomId, displayName, avatarUrl } = body;

  if (userId !== clerkUserId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const hasAccess = await hasAccessToProject(clerkUserId, roomId);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Ensure the room exists (private by default) and grant this user write access.
    // getOrCreateRoom only applies settings on first creation; updateRoom keeps
    // collaborators in sync on every subsequent auth call.
    await liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] });
    await liveblocks.updateRoom(roomId, {
      usersAccesses: { [userId]: ["room:write"] },
    });
  } catch (err) {
    console.error("[liveblocks-auth] room setup failed:", err);
    return Response.json({ error: "Failed to set up room" }, { status: 500 });
  }

  try {
    const { status, body: responseBody } = await liveblocks.identifyUser(
      userId,
      {
        userInfo: {
          displayName,
          avatarUrl,
          cursorColor: getCursorColor(userId),
        },
      }
    );

    return new Response(responseBody, { status });
  } catch (err) {
    console.error("[liveblocks-auth] identifyUser failed:", err);
    return Response.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
