import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";
import { get, BlobNotFoundError } from "@vercel/blob";

type RouteContext = { params: Promise<{ projectId: string; specId: string }> };

// GET /api/projects/[projectId]/specs/[specId]
// Returns the raw Markdown content of a spec (not as an attachment).
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await params;

  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let spec: { filePath: string } | null;
  try {
    spec = await prisma.spec.findFirst({
      where: { id: specId, projectId },
      select: { filePath: true },
    });
  } catch (error) {
    console.error("[GET /api/projects/:projectId/specs/:specId] db", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }

  if (!spec) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const blobMeta = await get(spec.filePath, { access: "private" });
    if (!blobMeta?.stream) {
      return Response.json({ error: "Spec file not found" }, { status: 404 });
    }

    return new Response(blobMeta.stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return Response.json({ error: "Spec file not found" }, { status: 404 });
    }
    console.error("[GET /api/projects/:projectId/specs/:specId] blob", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
