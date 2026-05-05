import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth as triggerAuth } from "@trigger.dev/sdk";

// POST /api/ai/spec/token — issue a run-scoped public token for realtime monitoring
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

  const { runId } = (body ?? {}) as Record<string, unknown>;

  if (typeof runId !== "string" || !runId) {
    return Response.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const token = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });

    return Response.json({ ok: true, token });
  } catch (error) {
    console.error("[POST /api/ai/spec/token]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
