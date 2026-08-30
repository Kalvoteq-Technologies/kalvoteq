import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { ResearchBriefing } from "./stories.functions";

export interface ResearchJobRow {
  id: string;
  briefing: ResearchBriefing | null;
  confidence_score: number | null;
  created_at: string;
}

export interface ResearchJobSummary {
  id: string;
  story_id: string;
  status: "pending" | "completed" | "failed";
  confidence_score: number | null;
}

// Latest research job per story, used to look up which job to hand to
// generateDraft from the discovered-stories queue.
export const researchJobsByStoryQuery = () =>
  queryOptions({
    queryKey: ["research-jobs", "by-story"],
    queryFn: async (): Promise<Record<string, ResearchJobSummary>> => {
      const { data, error } = await supabase
        .from("research_jobs")
        .select("id, story_id, status, confidence_score")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      const byStory: Record<string, ResearchJobSummary> = {};
      for (const row of data ?? []) {
        // Rows arrive newest-first, so the first one seen per story is the latest.
        if (!byStory[row.story_id]) byStory[row.story_id] = row as ResearchJobSummary;
      }
      return byStory;
    },
  });

// RLS restricts research_jobs to admins, so this is safe as a direct client query
// (matches the pattern used for other admin-only reads throughout the app).
export const researchJobQuery = (id: string | null | undefined) =>
  queryOptions({
    queryKey: ["research-jobs", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ResearchJobRow | null> => {
      const { data, error } = await supabase
        .from("research_jobs")
        .select("id, briefing, confidence_score, created_at")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as ResearchJobRow | null;
    },
  });
