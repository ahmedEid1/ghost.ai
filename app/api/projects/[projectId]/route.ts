import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, description: true, status: true, ownerId: true },
    });

    if (!project) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }

    const hasAccess = await hasAccessToProject(userId, projectId);
    if (!hasAccess) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ownerId, ...rest } = project;
    return Response.json({ ...rest, isOwner: ownerId === userId });
  } catch (error) {
    console.error("[GET /api/projects/:projectId]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, description, status } = body as Record<string, unknown>;

  const VALID_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"];

  if (name === undefined && description === undefined && status === undefined) {
    return Response.json(
      { error: "At least one of name, description, or status is required" },
      { status: 400 }
    );
  }
  let trimmedName: string | undefined;
  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return Response.json(
        { error: "name must be a non-empty string" },
        { status: 400 }
      );
    }
    trimmedName = name.trim();
  }
  if (description !== undefined && typeof description !== "string") {
    return Response.json(
      { error: "description must be a string" },
      { status: 400 }
    );
  }
  if (status !== undefined && (typeof status !== "string" || !VALID_STATUSES.includes(status))) {
    return Response.json(
      { error: "status must be one of DRAFT, ACTIVE, ARCHIVED" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!existing) return { error: "Not Found" as const, status: 404 as const };
      if (existing.ownerId !== userId) return { error: "Forbidden" as const, status: 403 as const };

      const updated = await tx.project.update({
        where: { id: projectId },
        data: {
          ...(trimmedName !== undefined ? { name: trimmedName } : {}),
          ...(typeof description === "string" ? { description } : {}),
          ...(typeof status === "string" ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
        },
        select: { id: true, name: true, description: true, status: true },
      });

      return { data: updated };
    });

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ ...result.data, isOwner: true });
  } catch (error) {
    console.error("[PATCH /api/projects/:projectId]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });

      if (!existing) return { error: "Not Found" as const, status: 404 as const };
      if (existing.ownerId !== userId) return { error: "Forbidden" as const, status: 403 as const };

      await tx.project.delete({ where: { id: projectId } });
      return { success: true as const };
    });

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ message: "Project deleted" });
  } catch (error) {
    console.error("[DELETE /api/projects/:projectId]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
