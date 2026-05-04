"use client";

import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Project } from "@/lib/types";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onOpenCreateDialog: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: Project;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl px-2 py-2 hover:bg-subtle min-w-0 transition-colors">
      <span className="flex-1 text-sm text-text-primary truncate min-w-0">
        {project.name}
      </span>
      {project.isOwner && (
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRename(project);
            }}
            className="h-7 w-7 text-text-muted hover:text-text-primary"
            aria-label={`Rename ${project.name}`}
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
            className="h-7 w-7 text-text-muted hover:text-state-error"
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
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.isOwner);
  const sharedProjects = projects.filter((p) => !p.isOwner);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:bg-transparent"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-12 left-0 h-[calc(100vh-3rem)] w-72 z-40 flex flex-col bg-surface border-r border-border-default transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default shrink-0">
          <span className="text-sm font-semibold text-text-primary">
            Projects
          </span>
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
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="mx-4 mt-3 shrink-0">
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
                <p className="text-text-muted text-sm text-center py-8">
                  No projects yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
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
                <p className="text-text-muted text-sm text-center py-8">
                  Nothing shared with you yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-border-default shrink-0">
          <Button className="w-full gap-2" onClick={onOpenCreateDialog}>
            <Plus className="h-4 w-4" />
            Create New Project
          </Button>
        </div>
      </div>
    </>
  );
}
