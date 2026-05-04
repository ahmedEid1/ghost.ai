import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasAccessToProject } from "@/lib/project-access";
import { NoAccess } from "@/components/editor/no-access";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

interface EditorWorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      ownerId: true,
    },
  });

  if (!project) notFound();

  const hasAccess = await hasAccessToProject(userId, roomId);
  if (!hasAccess) return <NoAccess projectId={roomId} />;

  return (
    <WorkspaceShell
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        isOwner: project.ownerId === userId,
      }}
    />
  );
}
