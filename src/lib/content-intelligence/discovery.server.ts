// Server-only: pulls due RSS sources, scores new items, and stores them.
// Triggered by the internal cron route, never by client code.
import Parser from "rss-parser";

import type { Json } from "@/integrations/supabase/types";
import { CONTENT_SCORE_THRESHOLD, scoreStory } from "./scoring";

const USER_AGENT = "KalvoteqContentIntelligence/1.0 (+https://kalvoteq.com)";

const parser = new Parser({ timeout: 10_000, headers: { "User-Agent": USER_AGENT } });

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DiscoveryResult {
  sourcesChecked: number;
  storiesInserted: number;
  errors: string[];
}

export async function runDiscovery(): Promise<DiscoveryResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: sources, error } = await supabaseAdmin
    .from("content_sources")
    .select("*")
    .eq("enabled", true);
  if (error) throw error;

  const due = (sources ?? []).filter((s) => {
    if (!s.last_checked_at) return true;
    const dueAt = new Date(s.last_checked_at).getTime() + s.fetch_frequency_minutes * 60_000;
    return Date.now() >= dueAt;
  });

  let storiesInserted = 0;
  const errors: string[] = [];

  for (const source of due) {
    try {
      const feed = await parser.parseURL(source.feed_url);

      for (const item of (feed.items ?? []).slice(0, 20)) {
        const externalId = item.guid || item.link;
        if (!externalId || !item.link || !item.title) continue;

        const publishedAt =
          item.isoDate ?? (item.pubDate ? new Date(item.pubDate).toISOString() : null);
        const summary = stripHtml(item.contentSnippet || item.content || "").slice(0, 500);
        const { overall, breakdown } = scoreStory({
          title: item.title,
          summary,
          publishedAt,
          sourceTrustScore: source.trust_score,
        });

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("discovered_stories")
          .upsert(
            {
              source_id: source.id,
              external_id: externalId,
              title: item.title.slice(0, 500),
              source_url: item.link,
              author: item.creator ?? null,
              published_at: publishedAt,
              summary,
              category: source.category,
              overall_score: overall,
              score_breakdown: breakdown as unknown as Json,
              status: overall >= CONTENT_SCORE_THRESHOLD ? "new" : "rejected",
            },
            { onConflict: "source_id,external_id", ignoreDuplicates: true },
          )
          .select("id")
          .maybeSingle();
        if (insertError) throw insertError;
        if (inserted) storiesInserted += 1;
      }

      await supabaseAdmin
        .from("content_sources")
        .update({ last_checked_at: new Date().toISOString(), last_error: null })
        .eq("id", source.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown fetch error";
      errors.push(`${source.name}: ${message}`);
      await supabaseAdmin
        .from("content_sources")
        .update({ last_checked_at: new Date().toISOString(), last_error: message })
        .eq("id", source.id);
    }
  }

  return { sourcesChecked: due.length, storiesInserted, errors };
}
