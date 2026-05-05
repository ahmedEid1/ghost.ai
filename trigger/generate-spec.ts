import { schemaTask, metadata, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import { generateText } from "ai";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { createAnthropicClient, getAnthropicModel } from "@/lib/ai";

// ─── Payload schema ────────────────────────────────────────────────────────────

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const NodeSchema = z.record(z.unknown());
const EdgeSchema = z.record(z.unknown());

const GenerateSpecSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(ChatMessageSchema).default([]),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Ghost AI, a technical documentation expert. Generate a comprehensive Markdown technical specification from a system architecture canvas.

Structure the document as follows:

# [Project Name] — Technical Specification

## Executive Summary
Brief overview of what this system does and its key architectural decisions.

## System Overview
High-level description of the architecture pattern and main components.

## Components
For each component, include:
### [Component Name]
- **Type**: (service / database / gateway / client / external / etc.)
- **Purpose**: What this component does
- **Responsibilities**: Bullet list
- **Technology Suggestions**: Recommended tech stack

## Data Flow
Describe how data moves through the system, referencing connections between components.

## Integration Boundaries
External systems, third-party services, and integration points.

## Deployment Considerations
Infrastructure, scaling, and operational notes.

## Open Questions
Unresolved decisions or areas needing further design.

---

Use proper Markdown. Be specific and technical. Write for a senior engineering audience.`;

// ─── Task ──────────────────────────────────────────────────────────────────────

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: GenerateSpecSchema,
  maxDuration: 300,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload) => {
    const { projectId, nodes, edges, chatHistory } = payload;

    const anthropic = createAnthropicClient();
    const model = getAnthropicModel();

    metadata.set("status", "reading-canvas");
    logger.info("generate-spec: starting", { projectId, nodeCount: nodes.length, edgeCount: edges.length });

    if (nodes.length === 0) {
      throw new Error("Canvas is empty — add components before generating a spec");
    }

    // ── Build readable canvas summary ─────────────────────────────────────────

    const nodeIdToLabel = new Map<string, string>();
    for (const n of nodes) {
      const data = n.data as Record<string, unknown> | undefined;
      const label = typeof data?.label === "string" && data.label ? data.label : "Unnamed";
      if (typeof n.id === "string") nodeIdToLabel.set(n.id, label);
    }

    const nodeList = nodes
      .map((n) => {
        const data = n.data as Record<string, unknown> | undefined;
        const label = typeof data?.label === "string" && data.label ? data.label : "Unnamed";
        const shape = typeof data?.shape === "string" ? data.shape : "rectangle";
        return `- ${label} (${shape})`;
      })
      .join("\n");

    const edgeList = edges
      .map((e) => {
        const sourceLabel = typeof e.source === "string" ? (nodeIdToLabel.get(e.source) ?? e.source) : String(e.source);
        const targetLabel = typeof e.target === "string" ? (nodeIdToLabel.get(e.target) ?? e.target) : String(e.target);
        const data = e.data as Record<string, unknown> | undefined;
        const edgeLabel = typeof data?.label === "string" && data.label ? ` (${data.label})` : "";
        return `- ${sourceLabel} → ${targetLabel}${edgeLabel}`;
      })
      .join("\n");

    // ── Build chat context summary ────────────────────────────────────────────

    const chatSummary =
      chatHistory.length > 0
        ? `\n\nDesign discussion context:\n${chatHistory
            .map((m) => `${m.role === "user" ? "User" : "Ghost AI"}: ${m.content}`)
            .join("\n")}`
        : "";

    // ── Call Claude ───────────────────────────────────────────────────────────

    metadata.set("status", "generating");
    logger.info("generate-spec: calling Claude", { projectId });

    const { text } = await generateText({
      model: anthropic(model),
      system: SYSTEM_PROMPT,
      prompt: `Canvas components (${nodes.length} nodes):
${nodeList}

Connections (${edges.length} edges):
${edgeList}${chatSummary}

Generate the complete technical specification now.`,
    });

    metadata.set("status", "saving");
    logger.info("generate-spec: saving to blob", { projectId });

    // Generate a stable spec ID before uploading so blob path and DB ID match.
    const specId = crypto.randomUUID();
    const blobPath = `specs/${projectId}/${specId}.md`;

    const { url: filePath } = await put(blobPath, text, {
      access: "private",
      contentType: "text/markdown; charset=utf-8",
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    await prisma.spec.create({
      data: { id: specId, projectId, filePath },
    });

    metadata.set("status", "done");
    logger.info("generate-spec: done", { projectId, specId, wordCount: text.split(/\s+/).length });

    return { content: text, wordCount: text.split(/\s+/).length, specId };
  },
});
