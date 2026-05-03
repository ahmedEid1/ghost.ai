export interface Project {
  id: string;
  name: string;
  slug: string;
  owned: boolean;
  updatedAt: string;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    slug: "website-redesign",
    owned: true,
    updatedAt: "2026-05-01",
  },
  {
    id: "2",
    name: "Mobile App Flow",
    slug: "mobile-app-flow",
    owned: true,
    updatedAt: "2026-04-28",
  },
  {
    id: "3",
    name: "API Architecture",
    slug: "api-architecture",
    owned: true,
    updatedAt: "2026-04-20",
  },
  {
    id: "4",
    name: "Design System Docs",
    slug: "design-system-docs",
    owned: false,
    updatedAt: "2026-04-15",
  },
  {
    id: "5",
    name: "Marketing Campaign",
    slug: "marketing-campaign",
    owned: false,
    updatedAt: "2026-04-10",
  },
];

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
