import { createAnthropic } from "@ai-sdk/anthropic";

const DEFAULT_MODEL = "claude-sonnet-4-6";

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
}

export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return createAnthropic({ apiKey });
}
