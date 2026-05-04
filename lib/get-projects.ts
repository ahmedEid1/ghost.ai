import { prisma } from "@/lib/prisma";
import { type Project } from "@/lib/types";

const PROJECT_SELECT = {
  id: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
} as const;

export async function getUserProjects(
  userId: string,
  userEmails: string[]
): Promise<Project[]> {
  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: PROJECT_SELECT,
    }),
    userEmails.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: { collaboratorEmail: { in: userEmails } },
            },
          },
          orderBy: { createdAt: "desc" },
          select: PROJECT_SELECT,
        })
      : Promise.resolve([]),
  ]);

  return [
    ...owned.map((p) => ({ ...p, isOwner: true as const })),
    ...shared.map((p) => ({ ...p, isOwner: false as const })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(({ createdAt: _c, ...rest }) => rest);
}
