import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";
import { tasks } from "@trigger.dev/sdk";
import type { designAgent } from "@/trigger/design-agent";

const PROMPT_MAX_LENGTH = 4000;

// POST /api/ai/design — trigger design generation background task
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt: rawPrompt, roomId, projectId } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof rawPrompt !== "string" ||
    typeof roomId !== "string" || !roomId ||
    typeof projectId !== "string" || !projectId
  ) {
    return Response.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 },
    );
  }

  // roomId must equal projectId — the Liveblocks room ID is always the project ID
  if (roomId !== projectId) {
    return Response.json({ error: "roomId must match projectId" }, { status: 400 });
  }

  const prompt = rawPrompt.trim();
  if (!prompt) {
    return Response.json({ error: "prompt must not be empty" }, { status: 400 });
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    return Response.json(
      { error: `prompt must be at most ${PROMPT_MAX_LENGTH} characters` },
      { status: 400 },
    );
  }

  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const handle = await tasks.trigger<typeof designAgent>(
      "design-agent",
      { prompt, roomId, projectId, userId },
    );

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return Response.json({ ok: true, runId: handle.id });
  } catch (error) {
    console.error("[POST /api/ai/design]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
