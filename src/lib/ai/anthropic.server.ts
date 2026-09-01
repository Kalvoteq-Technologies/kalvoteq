// Server-only: thin wrapper around the Anthropic Messages API. Kept as the single
// place that knows which provider/model is in use, so swapping providers later
// only touches this file.
import Anthropic from "@anthropic-ai/sdk";

function client(): Anthropic {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey });
}

const MODEL = process.env["ANTHROPIC_MODEL"] || "claude-sonnet-5";

export async function generateText(
  system: string,
  prompt: string,
  maxTokens = 4096,
): Promise<string> {
  const message = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text in Claude response");
  return textBlock.text;
}

/** Forces a tool call so Claude returns structured JSON matching `schema` instead of prose. */
export async function generateJSON<T>(
  system: string,
  prompt: string,
  schema: { name: string; description: string; input_schema: Record<string, unknown> },
  maxTokens = 4096,
): Promise<T> {
  const message = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: schema.name,
        description: schema.description,
        input_schema: schema.input_schema as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "tool", name: schema.name },
  });
  if (message.stop_reason === "max_tokens") {
    console.warn(
      `[anthropic] Response hit max_tokens (${maxTokens}) — output was likely truncated mid-field.`,
    );
  }
  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return the expected structured output");
  }
  return toolUse.input as T;
}
