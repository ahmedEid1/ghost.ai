"use client";

import Link from "next/link";
import { FolderKanban, Plus, Pencil, Share2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Project } from "@/lib/types";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onOpenCreateDialog: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onShareProject: (project: Project) => void;
}

function ProjectItem({
  project,
  onClose,
  onEdit,
  onDelete,
  onShare,
}: {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onShare: (project: Project) => void;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-1 rounded-xl border border-transparent transition-colors hover:border-border-default hover:bg-elevated">
      <Link
        href={`/editor/${project.id}`}
        onClick={onClose}
        className="min-w-0 flex-1 truncate px-2 py-2 text-sm font-medium text-text-primary"
      >
        {project.name}
      </Link>
      {project.isOwner && (
        <div className="flex shrink-0 items-center gap-0.5 pr-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onShare(project);
            }}
            className="h-7 w-7 text-text-muted opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
            aria-label={`Share ${project.name}`}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="h-7 w-7 text-text-muted opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
            aria-label={`Edit ${project.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            className="h-7 w-7 text-text-muted opacity-0 transition-opacity hover:text-state-error group-hover:opacity-100"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onOpenCreateDialog,
  onEditProject,
  onDeleteProject,
  onShareProject,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.isOwner);
  const sharedProjects = projects.filter((p) => !p.isOwner);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed left-3 top-[3.75rem] z-40 flex h-[calc(100vh-4.5rem)] w-80 flex-col rounded-3xl border border-border-default bg-surface/95 shadow-[var(--shadow-panel)] backdrop-blur transition-transform duration-300 ease-out sm:left-3 ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-default px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary-dim">
              <FolderKanban className="h-4 w-4 text-accent-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-text-primary">
                Projects
              </span>
              <p className="text-xs text-text-muted">{projects.length} total</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-text-muted hover:text-text-primary"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          defaultValue="my-projects"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-3 shrink-0 bg-elevated">
            <TabsTrigger value="my-projects" className="flex-1 text-xs">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1 text-xs">
              Shared with Me
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="flex-1 overflow-y-auto mt-0"
          >
            <div className="px-3 py-2">
              {myProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-muted">
                  No projects yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onClose={onClose}
                      onEdit={onEditProject}
                      onDelete={onDeleteProject}
                      onShare={onShareProject}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="shared"
            className="flex-1 overflow-y-auto mt-0"
          >
            <div className="px-3 py-2">
              {sharedProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-muted">
                  Nothing shared with you yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onClose={onClose}
                      onEdit={onEditProject}
                      onDelete={onDeleteProject}
                      onShare={onShareProject}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border-default p-4">
          <Button className="w-full gap-2" onClick={onOpenCreateDialog}>
            <Plus className="h-4 w-4" />
            Create New Project
          </Button>
        </div>
      </div>
    </>
  );
}
