import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getUserEmails(): Promise<string[]> {
  const user = await currentUser();
  return (user?.emailAddresses ?? []).map((e) => e.emailAddress);
}

export async function hasAccessToProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return false;
  if (project.ownerId === userId) return true;

  const userEmails = await getUserEmails();
  if (userEmails.length === 0) return false;

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: { projectId, collaboratorEmail: { in: userEmails } },
    select: { id: true },
  });

  return collaborator !== null;
}
