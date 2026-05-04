import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserProjects } from "@/lib/get-projects";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const userEmails = (user?.emailAddresses ?? []).map((e) => e.emailAddress);

  try {
    const projects = await getUserProjects(userId, userEmails);
    return Response.json({ projects });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, description } = body as Record<string, unknown>;

  if (name !== undefined && typeof name !== "string") {
    return Response.json({ error: "name must be a string" }, { status: 400 });
  }
  if (description !== undefined && typeof description !== "string") {
    return Response.json(
      { error: "description must be a string" },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name:
          typeof name === "string" && name.trim() ? name.trim() : "Untitled Project",
        description: typeof description === "string" ? description : undefined,
      },
      select: { id: true, name: true, description: true, status: true },
    });

    return Response.json(
      { ...project, isOwner: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
