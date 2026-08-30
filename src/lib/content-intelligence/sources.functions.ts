import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/require-admin";

export interface ContentSource {
  id: string;
  name: string;
  source_type: "rss" | "api" | "manual";
  feed_url: string;
  category: string;
  trust_score: number;
  enabled: boolean;
  fetch_frequency_minutes: number;
  last_checked_at: string | null;
  last_error: string | null;
  created_at: string;
}

export const listSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ContentSource[]> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("content_sources")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []) as ContentSource[];
  });

const addSourceInput = z.object({
  name: z.string().trim().min(2).max(120),
  feedUrl: z.string().trim().url().max(500),
  category: z.string().trim().min(2).max(80),
  trustScore: z.number().int().min(0).max(100).default(70),
});

export const addSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => addSourceInput.parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("content_sources").insert({
      name: data.name,
      source_type: "rss",
      feed_url: data.feedUrl,
      category: data.category,
      trust_score: data.trustScore,
    });
    if (error) throw error;
    return { ok: true };
  });

const toggleSourceInput = z.object({
  id: z.string().uuid(),
  enabled: z.boolean(),
});

export const toggleSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => toggleSourceInput.parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("content_sources")
      .update({ enabled: data.enabled })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
