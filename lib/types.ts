export type ProjectStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  isOwner: boolean;
}
