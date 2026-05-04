import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditorShell } from "@/components/editor/editor-shell";
import { type Project } from "@/lib/types";

async function fetchProjects(): Promise<Project[]> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? null;

  const SELECT = {
    id: true,
    name: true,
    description: true,
    status: true,
    createdAt: true,
  } as const;

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: SELECT,
    }),
    userEmail
      ? prisma.project.findMany({
          where: { collaborators: { some: { collaboratorEmail: userEmail } } },
          orderBy: { createdAt: "desc" },
          select: SELECT,
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

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await fetchProjects();
  return <EditorShell initialProjects={projects}>{children}</EditorShell>;
}
