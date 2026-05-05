import { put, get, head, del } from "@vercel/blob";

export interface CanvasPayload {
  nodes: unknown[];
  edges: unknown[];
  version?: number;
  savedAt?: string;
}

function blobPath(projectId: string): string {
  return `canvas/${projectId}.json`;
}

export async function saveCanvasBlob(
  projectId: string,
  payload: CanvasPayload
): Promise<string> {
  const body = JSON.stringify(payload);
  const path = blobPath(projectId);

  const { url } = await put(path, body, {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return url;
}

export async function loadCanvasBlob(
  blobUrl: string
): Promise<CanvasPayload | null> {
  const result = await get(blobUrl, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;

  let text: string;
  try {
    text = await new Response(result.stream).text();
  } catch {
    return null;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (!isCanvasPayload(data)) return null;

  return data;
}

export function isCanvasPayload(value: unknown): value is CanvasPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj.nodes) && Array.isArray(obj.edges);
}

export async function deleteCanvasBlob(blobUrl: string): Promise<void> {
  try {
    await del(blobUrl);
  } catch {
    // Best-effort — do not surface deletion failures to callers
  }
}

export async function blobExists(blobUrl: string): Promise<boolean> {
  try {
    await head(blobUrl);
    return true;
  } catch {
    return false;
  }
}
