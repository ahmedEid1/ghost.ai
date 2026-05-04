import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const { name, description } = body as Record<string, unknown>;

  if (name === undefined && description === undefined) {
    return Response.json(
      { error: "At least one of name or description is required" },
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

  try {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!existing) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(trimmedName !== undefined ? { name: trimmedName } : {}),
        ...(typeof description === "string" ? { description } : {}),
      },
      select: { id: true, name: true, description: true, status: true },
    });

    return Response.json({ ...updated, isOwner: true });
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
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!existing) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id: projectId } });

    return Response.json({ message: "Project deleted" });
  } catch (error) {
    console.error("[DELETE /api/projects/:projectId]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
