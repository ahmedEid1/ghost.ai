import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        collaborators: {
          select: { id: true, collaboratorEmail: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      const clerk = await clerkClient();
      const currentUserData = await clerk.users.getUser(userId);
      const currentUserEmails = currentUserData.emailAddresses.map(
        (e) => e.emailAddress
      );
      const isCollaborator = project.collaborators.some((c) =>
        currentUserEmails.includes(c.collaboratorEmail)
      );
      if (!isCollaborator) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const clerk = await clerkClient();
    const ownerData = await clerk.users.getUser(project.ownerId);

    const collaboratorEmails = project.collaborators.map(
      (c) => c.collaboratorEmail
    );
    const clerkUsersResponse =
      collaboratorEmails.length > 0
        ? await clerk.users.getUserList({
            emailAddress: collaboratorEmails,
            limit: 100,
          })
        : { data: [] };

    const emailToClerkUser = new Map(
      clerkUsersResponse.data.flatMap((u) =>
        u.emailAddresses.map((e) => [e.emailAddress, u])
      )
    );

    const collaborators = project.collaborators.map((c) => {
      const clerkUser = emailToClerkUser.get(c.collaboratorEmail);
      return {
        id: c.id,
        email: c.collaboratorEmail,
        displayName: clerkUser
          ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
            clerkUser.username ||
            c.collaboratorEmail
          : c.collaboratorEmail,
        imageUrl: clerkUser?.imageUrl ?? null,
        createdAt: c.createdAt,
      };
    });

    const ownerDisplayName =
      [ownerData.firstName, ownerData.lastName].filter(Boolean).join(" ") ||
      ownerData.username ||
      ownerData.emailAddresses[0]?.emailAddress ||
      "Owner";

    return Response.json({
      owner: {
        id: project.ownerId,
        displayName: ownerDisplayName,
        imageUrl: ownerData.imageUrl ?? null,
        email: ownerData.emailAddresses[0]?.emailAddress ?? null,
      },
      collaborators,
      isOwner,
    });
  } catch (error) {
    console.error("[GET /api/projects/:projectId/collaborators]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const { email } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return Response.json(
      { error: "email must be a non-empty string" },
      { status: 400 }
    );
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

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

    const clerk = await clerkClient();
    const ownerData = await clerk.users.getUser(userId);
    const ownerEmails = ownerData.emailAddresses.map((e) =>
      e.emailAddress.toLowerCase()
    );
    if (ownerEmails.includes(trimmedEmail)) {
      return Response.json(
        { error: "Cannot add yourself as a collaborator" },
        { status: 400 }
      );
    }

    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_collaboratorEmail: {
          projectId,
          collaboratorEmail: trimmedEmail,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "This person is already a collaborator" },
        { status: 409 }
      );
    }

    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId, collaboratorEmail: trimmedEmail },
      select: { id: true, collaboratorEmail: true, createdAt: true },
    });

    const clerkUsersResponse = await clerk.users.getUserList({
      emailAddress: [trimmedEmail],
      limit: 1,
    });
    const clerkUser = clerkUsersResponse.data[0] ?? null;

    return Response.json(
      {
        id: collaborator.id,
        email: collaborator.collaboratorEmail,
        displayName: clerkUser
          ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
            clerkUser.username ||
            trimmedEmail
          : trimmedEmail,
        imageUrl: clerkUser?.imageUrl ?? null,
        createdAt: collaborator.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/projects/:projectId/collaborators]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
