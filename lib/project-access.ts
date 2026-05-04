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

export async function getProjectMembers(projectId: string): Promise<string[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      collaborators: { select: { collaboratorEmail: true } },
    },
  });

  if (!project) return [];

  return [
    project.ownerId,
    ...project.collaborators.map((c) => c.collaboratorEmail),
  ];
}

export async function getUserProjects(userId: string): Promise<string[]> {
  const userEmails = await getUserEmails();

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    userEmails.length > 0
      ? prisma.projectCollaborator.findMany({
          where: { collaboratorEmail: { in: userEmails } },
          select: { projectId: true },
        })
      : Promise.resolve([]),
  ]);

  return [
    ...new Set([...owned.map((p) => p.id), ...shared.map((c) => c.projectId)]),
  ];
}

export async function isUserProjectOwner(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  return project?.ownerId === userId;
}

export async function isUserCollaborator(
  userId: string,
  projectId: string
): Promise<boolean> {
  void userId;
  const userEmails = await getUserEmails();
  if (userEmails.length === 0) return false;

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: { projectId, collaboratorEmail: { in: userEmails } },
    select: { id: true },
  });

  return collaborator !== null;
}
