// Deterministic relevance scoring — no AI call. Runs against every discovered
// story at ingestion time so scoring dozens of items a day costs nothing. The
// AI is reserved for the (admin-triggered) research and drafting steps.

// Keyword -> weight (1-10), matched case-insensitively against title + summary.
// Kept as a plain constant rather than a DB-editable table for v1 — promote it
// to `editorial_topics` later if the weights genuinely need tuning from the UI.
const TOPIC_WEIGHTS: Record<string, number> = {
  "ai agent": 10,
  "ai agents": 10,
  "enterprise ai": 10,
  "artificial intelligence": 8,
  "machine learning": 8,
  llm: 8,
  kubernetes: 9,
  devops: 8,
  "cloud computing": 7,
  infrastructure: 6,
  cybersecurity: 8,
  "security vulnerability": 7,
  api: 5,
  "software architecture": 9,
  modernization: 8,
  "developer productivity": 7,
  saas: 6,
  fintech: 6,
  healthtech: 6,
  logistics: 5,
  "digital transformation": 8,
  "engineering leadership": 8,
  "engineering hiring": 7,
  "team augmentation": 8,
  "european technology": 6,
  estonia: 7,
  "eu regulation": 8,
  "ai act": 9,
  "ai regulation": 9,
  "data protection": 7,
  gdpr: 7,
  "digital policy": 6,
  "open source": 6,
  "kubernetes-native": 7,
  postgres: 6,
  postgresql: 6,
};

function hoursSince(iso: string | null): number {
  if (!iso) return 72;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, ms / 3_600_000);
}

function freshnessScore(publishedAt: string | null): number {
  const hours = hoursSince(publishedAt);
  if (hours <= 6) return 100;
  if (hours >= 96) return 30;
  // Linear decay from 100 at 6h to 30 at 96h.
  return Math.round(100 - ((hours - 6) / (96 - 6)) * 70);
}

function topicScore(title: string, summary: string): number {
  const haystack = `${title} ${summary}`.toLowerCase();
  let matched = 0;
  let hits = 0;
  for (const [keyword, weight] of Object.entries(TOPIC_WEIGHTS)) {
    if (haystack.includes(keyword)) {
      matched += weight;
      hits += 1;
    }
  }
  if (hits === 0) return 15; // Off-topic by default, not zero — lets a strong source score still surface it.
  return Math.min(100, Math.round((matched / (hits * 10)) * 100 * Math.min(1, hits / 2 + 0.5)));
}

export interface ScoreBreakdown {
  topic: number;
  trust: number;
  freshness: number;
}

export function scoreStory(input: {
  title: string;
  summary: string;
  publishedAt: string | null;
  sourceTrustScore: number;
}): { overall: number; breakdown: ScoreBreakdown } {
  const topic = topicScore(input.title, input.summary);
  const trust = input.sourceTrustScore;
  const freshness = freshnessScore(input.publishedAt);
  const overall = Math.round(topic * 0.4 + trust * 0.35 + freshness * 0.25);
  return { overall, breakdown: { topic, trust, freshness } };
}

export const CONTENT_SCORE_THRESHOLD = 60;
