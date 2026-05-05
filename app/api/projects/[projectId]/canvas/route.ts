import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";
import {
  saveCanvasBlob,
  loadCanvasBlob,
  isCanvasPayload,
  type CanvasPayload,
} from "@/lib/canvas-storage";

type RouteContext = { params: Promise<{ projectId: string }> };

// PUT /api/projects/[projectId]/canvas — persist canvas graph to blob storage
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const hasAccess = await hasAccessToProject(userId, projectId);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isCanvasPayload(body)) {
    return Response.json(
      { error: "Invalid payload: nodes and edges arrays are required" },
      { status: 400 }
    );
  }

  const payload: CanvasPayload = {
    nodes: body.nodes,
    edges: body.edges,
    version: typeof body.version === "number" ? body.version : 1,
    savedAt: new Date().toISOString(),
  };

  try {
    const canvasUrl = await saveCanvasBlob(projectId, payload);

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: canvasUrl },
    });

    return Response.json({ ok: true, canvasUrl, savedAt: payload.savedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[PUT /api/projects/:projectId/canvas]", message, error);
    return Response.json({ error: "Internal Server Error", detail: message }, { status: 500 });
  }
}

// GET /api/projects/[projectId]/canvas — load latest saved canvas from blob storage
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
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { canvasJsonPath: true },
    });

    if (!project?.canvasJsonPath) {
      return Response.json({ ok: true, hasSavedCanvas: false, canvas: null, canvasUrl: null });
    }

    const canvas = await loadCanvasBlob(project.canvasJsonPath);

    if (!canvas) {
      return Response.json({ ok: true, hasSavedCanvas: false, canvas: null, canvasUrl: null });
    }

    return Response.json({
      ok: true,
      hasSavedCanvas: true,
      canvas: { nodes: canvas.nodes, edges: canvas.edges },
      canvasUrl: project.canvasJsonPath,
    });
  } catch (error) {
    console.error("[GET /api/projects/:projectId/canvas]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
