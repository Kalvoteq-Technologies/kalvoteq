import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readingTimeFromHtml, slugify } from "@/lib/blog";
import { requireAdmin } from "@/lib/require-admin";

// Keep select strings untyped so supabase-js does not try to parse joins at the type level.
const sel = (s: string): string => s;

export type DiscoveredStoryStatus =
  "new" | "researching" | "researched" | "drafted" | "rejected" | "archived";

export interface DiscoveredStory {
  id: string;
  source_id: string;
  title: string;
  source_url: string;
  author: string | null;
  published_at: string | null;
  discovered_at: string;
  summary: string | null;
  category: string | null;
  overall_score: number;
  score_breakdown: { topic: number; trust: number; freshness: number };
  status: DiscoveredStoryStatus;
  post_id: string | null;
  content_sources: { name: string } | null;
}

export type { ResearchBriefing, ResearchSource, GeneratedArticle } from "./prompts";

// Claude's tool-use output is not guaranteed to match input_schema even under a forced tool
// call — observed in practice when the source material is thin and the model has little to
// report. Validate and retry once before giving up, rather than trusting the first response.
async function generateValidated<T>(
  system: string,
  prompt: string,
  toolSchema: { name: string; description: string; input_schema: Record<string, unknown> },
  schema: z.ZodType<T>,
  maxTokens?: number,
): Promise<T> {
  const { generateJSON } = await import("@/lib/ai/anthropic.server");
  let lastIssues = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await generateJSON<unknown>(system, prompt, toolSchema, maxTokens);
    const result = schema.safeParse(raw);
    if (result.success) return result.data;
    lastIssues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    console.warn(
      `[content-intelligence] Structured output failed validation (attempt ${attempt}/2): ${lastIssues}`,
    );
  }
  throw new Error(`Claude's response did not match the expected format: ${lastIssues}`);
}

export const listDiscoveredStories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DiscoveredStory[]> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("discovered_stories")
      .select(sel("*, content_sources(name)"))
      .order("overall_score", { ascending: false })
      .limit(200)
      .returns<DiscoveredStory[]>();
    if (error) throw error;
    return data ?? [];
  });

const storyIdInput = z.object({ storyId: z.string().uuid() });

export const rejectStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => storyIdInput.parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("discovered_stories")
      .update({ status: "rejected" })
      .eq("id", data.storyId);
    if (error) throw error;
    return { ok: true };
  });

export const researchStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => storyIdInput.parse(data))
  .handler(async ({ context, data }): Promise<{ researchJobId: string }> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: story, error: storyError } = await supabaseAdmin
      .from("discovered_stories")
      .select("*")
      .eq("id", data.storyId)
      .single();
    if (storyError) throw storyError;

    const { data: source } = await supabaseAdmin
      .from("content_sources")
      .select("name")
      .eq("id", story.source_id)
      .maybeSingle();

    await supabaseAdmin
      .from("discovered_stories")
      .update({ status: "researching" })
      .eq("id", data.storyId);

    let extractedText = story.summary ?? "";
    try {
      const { extractArticleText } = await import("./extract.server");
      extractedText = await extractArticleText(story.source_url, story.title);
    } catch (err) {
      console.warn("[content-intelligence] Extraction failed, using feed summary only", err);
    }

    try {
      const {
        RESEARCH_SYSTEM_PROMPT,
        buildResearchPrompt,
        researchToolSchema,
        researchBriefingSchema,
      } = await import("./prompts");

      const briefing = await generateValidated(
        RESEARCH_SYSTEM_PROMPT,
        buildResearchPrompt({
          title: story.title,
          sourceUrl: story.source_url,
          publisher: source?.name ?? "Unknown source",
          publishedAt: story.published_at,
          extractedText,
        }),
        researchToolSchema,
        researchBriefingSchema,
        8000, // 15 substantive fields can exceed the default 4096-token budget on content-rich stories.
      );

      const { data: job, error: jobError } = await supabaseAdmin
        .from("research_jobs")
        .insert({
          story_id: data.storyId,
          status: "completed",
          briefing: briefing as never,
          confidence_score: briefing.confidence_score,
          created_by: context.userId,
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (jobError) throw jobError;

      await supabaseAdmin
        .from("discovered_stories")
        .update({ status: "researched" })
        .eq("id", data.storyId);

      return { researchJobId: job.id };
    } catch (err) {
      await supabaseAdmin
        .from("discovered_stories")
        .update({ status: "new" })
        .eq("id", data.storyId);
      throw err;
    }
  });

const researchJobIdInput = z.object({ researchJobId: z.string().uuid() });

export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => researchJobIdInput.parse(data))
  .handler(async ({ context, data }): Promise<{ postId: string }> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: job, error: jobError } = await supabaseAdmin
      .from("research_jobs")
      .select("*")
      .eq("id", data.researchJobId)
      .single();
    if (jobError) throw jobError;
    if (!job.briefing) throw new Error("This story has no completed research briefing yet.");

    const { data: story, error: storyError } = await supabaseAdmin
      .from("discovered_stories")
      .select("*")
      .eq("id", job.story_id)
      .single();
    if (storyError) throw storyError;

    const [{ data: categories }, { data: tags }] = await Promise.all([
      supabaseAdmin.from("categories").select("id, name, slug"),
      supabaseAdmin.from("tags").select("id, name, slug"),
    ]);

    const {
      researchBriefingSchema,
      ARTICLE_SYSTEM_PROMPT,
      buildArticlePrompt,
      articleToolSchema,
      generatedArticleSchema,
    } = await import("./prompts");
    const briefing = researchBriefingSchema.parse(job.briefing);

    const article = await generateValidated(
      ARTICLE_SYSTEM_PROMPT,
      buildArticlePrompt({
        storyTitle: story.title,
        briefing: briefing as unknown as Record<string, unknown>,
        contentType: briefing.recommended_content_type,
        categories: categories ?? [],
        tags: tags ?? [],
      }),
      articleToolSchema,
      generatedArticleSchema,
      8000, // Up to 1,800 words of article HTML plus metadata can exceed the default budget.
    );

    const category = (categories ?? []).find((c) => c.slug === article.category_slug);
    const matchedTags = (tags ?? []).filter((t) => article.tag_slugs.includes(t.slug));

    const confidence = job.confidence_score ?? 0;
    const verificationStatus: "verified" | "partially_verified" | "unverified" =
      confidence >= 85 ? "verified" : confidence >= 60 ? "partially_verified" : "unverified";

    let slug = slugify(article.title);
    const { data: existing } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .insert({
        slug,
        title: article.title,
        excerpt: article.excerpt.slice(0, 300),
        content: article.content_html,
        reading_time: readingTimeFromHtml(article.content_html),
        status: "draft",
        category_id: category?.id ?? null,
        author_id: context.userId,
        origin: "ai",
        verification_status: verificationStatus,
        research_job_id: job.id,
      })
      .select("id")
      .single();
    if (postError) throw postError;

    if (matchedTags.length > 0) {
      await supabaseAdmin
        .from("post_tags")
        .insert(matchedTags.map((t) => ({ post_id: post.id, tag_id: t.id })));
    }

    await supabaseAdmin
      .from("discovered_stories")
      .update({ status: "drafted", post_id: post.id })
      .eq("id", job.story_id);

    return { postId: post.id };
  });
