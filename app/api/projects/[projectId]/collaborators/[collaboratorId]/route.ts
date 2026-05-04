import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>;
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, collaboratorId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }
    if (project.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const collaborator = await prisma.projectCollaborator.findUnique({
      where: { id: collaboratorId },
      select: { id: true, projectId: true },
    });

    if (!collaborator || collaborator.projectId !== projectId) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }

    await prisma.projectCollaborator.delete({ where: { id: collaboratorId } });

    return Response.json({ message: "Collaborator removed" });
  } catch (error) {
    console.error(
      "[DELETE /api/projects/:projectId/collaborators/:collaboratorId]",
      error
    );
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
