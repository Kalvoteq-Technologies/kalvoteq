// Server-only: prompt text and structured-output schemas for the research and
// article-generation steps. Kept separate from the calling code so the editorial
// voice/rules can be reviewed and tuned without touching request plumbing.
import { z } from "zod";

const KALVOTEQ_CONTEXT = `Kalvoteq is an Estonia-based technology consulting and software engineering company.
Positioning: "Kalvoteq helps companies BUILD technology and SCALE engineering capability."

BUILD (Kalvoteq delivers technology): Custom Software Development, Enterprise Software, Mobile
Applications, API & Systems Integration, Quality Engineering, AI & Automation, Cloud & DevOps,
Software Modernization, Digital Transformation, Technology Consulting.

SCALE (Kalvoteq provides engineering talent): Dedicated Developers, Engineering Team Augmentation,
Dedicated Engineering Squads, Technical Specialists, Flexible Engineering Capacity.

Use the BUILD/SCALE framing only when a development genuinely connects to "how should companies
architect or implement this" (BUILD) or "what engineering capability will this require" (SCALE).
Do not force either into an article where it is not the natural angle.`;

const HOUSE_RULES = `Strict rules, no exceptions:
- Never copy, closely paraphrase, or spin source text. Write original synthesis in your own words.
- Never fabricate statistics, quotes, customer examples, Kalvoteq achievements, or testimonials.
- Never invent sources or attribute claims to a source that did not make them.
- Never name a specific Kalvoteq client, project, or case study — those may only be added later by
  a human editor from approved internal records.
- Never present speculation as fact, or manufacture urgency around a story.
- Distinguish established facts from your own analysis; do not blur the two.
- Do not publish or assert claims you cannot support from the supplied source material.
- Avoid clickbait headlines and rhetorical-question openers.
- Avoid filler phrases: "in today's rapidly evolving digital landscape", "in an ever-changing
  world", "it is important to note", or similar throat-clearing.
- Tone: professional, technical, confident, analytical, European enterprise consultancy. No hype.
- The piece should answer: what does this mean for businesses, CTOs, engineering leaders, product
  teams, or technology decision-makers?`;

export const RESEARCH_SYSTEM_PROMPT = `You are the research analyst for Kalvoteq's editorial team, a technology consultancy — not a news
desk. Your job is to produce an internal research briefing on a technology development, verifying
what can be verified and flagging what cannot.

${KALVOTEQ_CONTEXT}

${HOUSE_RULES}

You are given the discovered story's own summary and the extracted text of its source article as
your primary evidence. Base every factual claim in the briefing on that text; do not introduce
outside claims you cannot support. If the source material is thin, say so in your confidence
assessment rather than inventing detail.

Always call submit_research_briefing with every field populated, even when the extracted text is
mostly unusable (e.g. only navigation, cookie banners, or unrelated teasers, with no real article
body). In that case, write short honest values like "Not available from the extracted source" for
the fields you cannot support, set confidence_score low (under 30), and set
recommended_content_type to "no_content" — do not omit fields, and do not write anything outside
the tool call.`;

export function buildResearchPrompt(input: {
  title: string;
  sourceUrl: string;
  publisher: string;
  publishedAt: string | null;
  extractedText: string;
}): string {
  return `STORY TITLE: ${input.title}
SOURCE: ${input.publisher} — ${input.sourceUrl}
PUBLISHED: ${input.publishedAt ?? "unknown"}

SOURCE ARTICLE TEXT (extracted, may include noise — use only what is clearly article content):
"""
${input.extractedText.slice(0, 16000)}
"""

Produce a research briefing on this development for Kalvoteq's editorial team, and recommend what
content (if any) it merits.`;
}

export const researchToolSchema = {
  name: "submit_research_briefing",
  description: "Submit the structured research briefing for this story.",
  input_schema: {
    type: "object" as const,
    properties: {
      what_happened: { type: "string", description: "2-4 sentence factual summary." },
      key_facts: {
        type: "array",
        items: { type: "string" },
        description:
          "3-8 bullet facts, EACH AS ITS OWN ARRAY ELEMENT — not one string containing all of them.",
      },
      timeline: { type: "string" },
      who_is_involved: { type: "string" },
      technical_details: { type: "string" },
      business_implications: { type: "string" },
      engineering_implications: { type: "string" },
      risks: { type: "string" },
      opportunities: { type: "string" },
      cto_considerations: { type: "string" },
      engineering_leader_considerations: { type: "string" },
      kalvoteq_angle: {
        type: "string",
        description:
          "How this connects to BUILD or SCALE, or empty string if it genuinely does not apply.",
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            publisher: { type: "string" },
            is_primary: { type: "boolean" },
            credibility_score: { type: "integer", minimum: 0, maximum: 100 },
          },
          required: ["title", "url", "publisher", "is_primary", "credibility_score"],
        },
        description:
          "At minimum the source article itself; add others only if referenced in the text.",
      },
      confidence_score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description:
          "Overall confidence the facts above are well-supported by the source material.",
      },
      recommended_content_type: {
        type: "string",
        enum: [
          "no_content",
          "linkedin_only",
          "short_insight",
          "full_article",
          "technical_deep_dive",
          "executive_brief",
          "regulatory_explainer",
          "trend_analysis",
        ],
      },
      recommendation_reason: { type: "string" },
    },
    required: [
      "what_happened",
      "key_facts",
      "timeline",
      "who_is_involved",
      "technical_details",
      "business_implications",
      "engineering_implications",
      "risks",
      "opportunities",
      "cto_considerations",
      "engineering_leader_considerations",
      "kalvoteq_angle",
      "sources",
      "confidence_score",
      "recommended_content_type",
      "recommendation_reason",
    ],
  },
};

// Claude's tool-use output is not guaranteed to match `input_schema` exactly (a model can still
// return malformed or partially-shaped JSON under a forced tool call). Validate before trusting it
// anywhere downstream — an unvalidated briefing has previously produced a page-crashing draft.
// Claude has repeatedly written key_facts as a single bulleted string instead of a JSON array,
// even with a forced tool schema. Rather than keep failing on a purely cosmetic shape mismatch,
// accept a string and split it into array items.
const keyFactsField = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  return val
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s\-*•\d.)]+/, "").trim())
    .filter(Boolean);
}, z.array(z.string()).min(1));

export const researchBriefingSchema = z.object({
  what_happened: z.string(),
  key_facts: keyFactsField,
  timeline: z.string(),
  who_is_involved: z.string(),
  technical_details: z.string(),
  business_implications: z.string(),
  engineering_implications: z.string(),
  risks: z.string(),
  opportunities: z.string(),
  cto_considerations: z.string(),
  engineering_leader_considerations: z.string(),
  kalvoteq_angle: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      publisher: z.string(),
      is_primary: z.boolean(),
      credibility_score: z.number(),
    }),
  ),
  confidence_score: z.number().min(0).max(100),
  recommended_content_type: z.enum([
    "no_content",
    "linkedin_only",
    "short_insight",
    "full_article",
    "technical_deep_dive",
    "executive_brief",
    "regulatory_explainer",
    "trend_analysis",
  ]),
  recommendation_reason: z.string(),
});

export type ResearchSource = z.infer<typeof researchBriefingSchema>["sources"][number];
export type ResearchBriefing = z.infer<typeof researchBriefingSchema>;

export const ARTICLE_SYSTEM_PROMPT = `You are a senior editorial writer for Kalvoteq, a technology consultancy. You write for
kalvoteq.com/insights, aimed at CTOs, engineering leaders, and technology decision-makers.

${KALVOTEQ_CONTEXT}

${HOUSE_RULES}

Length: 1,000-1,800 words for a standard article, up to 2,500 for a technical deep dive. Structure:
a strong non-clickbait headline, a concise introduction, an explanation of the development, business
relevance, technical/practical implications, brief Kalvoteq analysis where genuinely relevant, and a
conclusion. Write the body as clean semantic HTML using only <p>, <h2>, <h3>, <ul>, <ol>, <li>,
<strong>, <em>, and <blockquote> tags — no <html>/<body>/<script>/<style>, no inline styles or
classes.

You are writing from an already-verified internal research briefing, not directly from the source
article — treat the briefing as ground truth and do not contradict it.`;

export function buildArticlePrompt(input: {
  storyTitle: string;
  briefing: Record<string, unknown>;
  contentType: string;
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
}): string {
  return `DEVELOPMENT: ${input.storyTitle}
RECOMMENDED FORMAT: ${input.contentType}

RESEARCH BRIEFING (ground truth — do not contradict):
${JSON.stringify(input.briefing, null, 2)}

EXISTING CATEGORIES (pick the single closest match by slug, do not invent a new one):
${input.categories.map((c) => `- ${c.slug}: ${c.name}`).join("\n")}

EXISTING TAGS (pick 0-4 that genuinely apply, by slug; do not invent new ones):
${input.tags.map((t) => `- ${t.slug}: ${t.name}`).join("\n")}

Write the full article now.`;
}

export const articleToolSchema = {
  name: "submit_article",
  description: "Submit the completed article and its metadata.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Non-clickbait headline, under 120 characters." },
      excerpt: {
        type: "string",
        description: "1-2 sentence summary shown in article lists, under 280 characters.",
      },
      content_html: { type: "string", description: "The full article body as semantic HTML." },
      category_slug: { type: "string", description: "One slug from the provided category list." },
      tag_slugs: {
        type: "array",
        items: { type: "string" },
        description: "0-4 slugs from the provided tag list.",
      },
      seo_title: { type: "string", description: "Under 60 characters." },
      meta_description: { type: "string", description: "Under 160 characters." },
    },
    required: [
      "title",
      "excerpt",
      "content_html",
      "category_slug",
      "tag_slugs",
      "seo_title",
      "meta_description",
    ],
  },
};

export const generatedArticleSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content_html: z.string().min(1),
  category_slug: z.string(),
  tag_slugs: z.array(z.string()),
  seo_title: z.string(),
  meta_description: z.string(),
});

export type GeneratedArticle = z.infer<typeof generatedArticleSchema>;
