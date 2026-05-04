import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProjects } from "@/lib/get-projects";
import { EditorShell } from "@/components/editor/editor-shell";
import { type Project } from "@/lib/types";

async function fetchProjects(): Promise<Project[]> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userEmails = (user?.emailAddresses ?? []).map((e) => e.emailAddress);

  return getUserProjects(userId, userEmails);
}

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await fetchProjects();
  return <EditorShell initialProjects={projects}>{children}</EditorShell>;
}
