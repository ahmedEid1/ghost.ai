import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghost AI - Design System",
  description:
    "The visual and motion language behind Ghost AI: studio palette, token-driven components, and live vignettes of the AI, real-time, and workflow surfaces.",
};

export default function UIShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
