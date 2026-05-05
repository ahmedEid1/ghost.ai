import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";

type RouteContext = { params: Promise<{ projectId: string }> };

// GET /api/projects/[projectId]/specs
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const specs = await prisma.spec.findMany({
      where: { projectId },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ specs });
  } catch (error) {
    console.error("[GET /api/projects/:projectId/specs] db", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
