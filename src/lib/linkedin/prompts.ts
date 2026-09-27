// Server-only: prompt and structured-output schema for turning an already-published
// Kalvoteq article into a LinkedIn Company Page post. Reuses the same editorial
// voice/house rules as article generation rather than duplicating them.
import { z } from "zod";

import { HOUSE_RULES, KALVOTEQ_CONTEXT } from "@/lib/content-intelligence/prompts";

export const LINKEDIN_SYSTEM_PROMPT = `You write LinkedIn Company Page posts for Kalvoteq, adapting an already-published article into a
short, native LinkedIn post — not a summary or a teaser, a standalone piece of writing that happens
to point to a longer article.

${KALVOTEQ_CONTEXT}

${HOUSE_RULES}

Structure: a strong opening line that states the insight, not the news ("X launched Y" is not an
opening line — lead with why it matters). Then 2-4 short paragraphs. Optionally 2-4 short bullet
points for a concrete list (tradeoffs, considerations, steps). No closing call-to-action sentence —
the article link is appended separately, do not write "read more" or similar yourself.

Length: 100-300 words total across hook, body, and bullets combined. Write for a LinkedIn feed:
short paragraphs (1-3 sentences), plain language, no markdown formatting, no emoji.`;

export function buildLinkedInPostPrompt(input: {
  articleTitle: string;
  articleExcerpt: string;
  articleContentText: string;
}): string {
  return `ARTICLE TITLE: ${input.articleTitle}
ARTICLE EXCERPT: ${input.articleExcerpt}

ARTICLE BODY (plain text, for reference — do not just re-summarize this, find the single most
useful insight in it and write from that angle):
"""
${input.articleContentText.slice(0, 6000)}
"""

Write the LinkedIn post now.`;
}

export const linkedinPostToolSchema = {
  name: "submit_linkedin_post",
  description: "Submit the LinkedIn post content.",
  input_schema: {
    type: "object" as const,
    properties: {
      hook: { type: "string", description: "The opening line — the insight, not the news." },
      body: {
        type: "string",
        description: "2-4 short paragraphs, separated by blank lines.",
      },
      bullets: {
        type: "array",
        items: { type: "string" },
        description: "0-4 short bullet points, only if the content genuinely suits a list.",
      },
      hashtags: {
        type: "array",
        items: { type: "string" },
        description: '3-5 relevant hashtags, no leading #, e.g. "SoftwareEngineering".',
      },
    },
    required: ["hook", "body", "bullets", "hashtags"],
  },
};

export const linkedinPostSchema = z.object({
  hook: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string()).max(6),
  hashtags: z.array(z.string()).min(1).max(6),
});

export type LinkedInPostDraft = z.infer<typeof linkedinPostSchema>;

export function composeLinkedInPostText(draft: LinkedInPostDraft, articleUrl: string): string {
  const parts = [draft.hook, draft.body];
  if (draft.bullets.length > 0) {
    parts.push(draft.bullets.map((b) => `• ${b}`).join("\n"));
  }
  parts.push(articleUrl);
  const hashtagLine = draft.hashtags
    .slice(0, 5)
    .map((h) => `#${h.replace(/^#/, "").replace(/\s+/g, "")}`)
    .join(" ");
  if (hashtagLine) parts.push(hashtagLine);
  return parts.join("\n\n");
}
