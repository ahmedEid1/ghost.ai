import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";
import { tasks } from "@trigger.dev/sdk";
import type { generateSpec } from "@/trigger/generate-spec";

// POST /api/ai/spec — trigger spec generation background task
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

  const { roomId, chatHistory, nodes, edges } = (body ?? {}) as Record<string, unknown>;

  if (typeof roomId !== "string" || !roomId) {
    return Response.json({ error: "roomId is required" }, { status: 400 });
  }
  if (!Array.isArray(nodes)) {
    return Response.json({ error: "nodes must be an array" }, { status: 400 });
  }
  if (!Array.isArray(edges)) {
    return Response.json({ error: "edges must be an array" }, { status: 400 });
  }
  if (chatHistory !== undefined && !Array.isArray(chatHistory)) {
    return Response.json({ error: "chatHistory must be an array" }, { status: 400 });
  }

  // roomId is always the project ID in this system
  const projectId = roomId;

  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId,
      roomId,
      chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
      nodes,
      edges,
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return Response.json({ ok: true, runId: handle.id });
  } catch (error) {
    console.error("[POST /api/ai/spec]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
