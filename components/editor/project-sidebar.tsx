"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <div
      className={`fixed top-12 left-0 h-[calc(100vh-3rem)] w-72 z-40 flex flex-col bg-surface border-r border-border-default transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <span className="text-sm font-semibold text-text-primary">Projects</span>
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

      <Tabs defaultValue="my-projects" className="flex flex-col flex-1 overflow-hidden">
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
          className="flex-1 flex items-center justify-center px-4"
        >
          <p className="text-text-muted text-sm text-center">No projects yet.</p>
        </TabsContent>

        <TabsContent
          value="shared"
          className="flex-1 flex items-center justify-center px-4"
        >
          <p className="text-text-muted text-sm text-center">
            Nothing shared with you yet.
          </p>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border-default shrink-0">
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Create New Project
        </Button>
      </div>
    </div>
  );
}
