// Server-only: fetches a source article and reduces it to plain text so it can
// be handed to Claude as research evidence. Deliberately simple — strips obvious
// chrome (script/style/nav/header/footer) rather than doing full readability
// extraction, and keeps only what's needed for one research call.

const USER_AGENT = "KalvoteqContentIntelligence/1.0 (+https://kalvoteq.com)";
const FETCH_TIMEOUT_MS = 10_000;
const MAX_EXTRACT_LENGTH = 16_000;

// Many sites put a large amount of chrome — nav, subscribe modals, related-article
// rails — before the actual article body in the raw HTML, sometimes hundreds of KB
// of it. Naively taking the first N characters of the stripped page text mostly
// captures that chrome, not the article. Anchoring to where the story's own title
// (already known from RSS) appears in the page reliably lands on the real content.
export async function extractArticleText(url: string, anchorTitle?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const text = htmlToPlainText(html);
    const start = anchorTitle ? findAnchoredStart(text, anchorTitle) : -1;
    return text.slice(Math.max(0, start), Math.max(0, start) + MAX_EXTRACT_LENGTH);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Finds where the article's own title actually begins in the page text. The title
 * commonly appears several times — a bare <title>/meta echo near the top, possibly
 * a "related/trending" widget link elsewhere, and the real headline — and which
 * occurrence is which varies by site, so occurrence order is not a reliable signal.
 * Instead, score the text following each occurrence for prose density (real article
 * body reads as flowing sentences; nav rails and related-article lists read as short
 * link fragments with few sentence-ending periods) and take the best-scoring one.
 */
function findAnchoredStart(text: string, title: string): number {
  const needle = title.slice(0, 40).trim().toLowerCase();
  if (!needle) return -1;
  const lower = text.toLowerCase();

  const positions: number[] = [];
  let idx = lower.indexOf(needle);
  while (idx !== -1 && positions.length < 8) {
    positions.push(idx);
    idx = lower.indexOf(needle, idx + needle.length);
  }
  if (positions.length === 0) return -1;

  let best = -1;
  let bestScore = -1;
  for (const pos of positions) {
    const window = text.slice(pos, pos + 1500);
    const score = (window.match(/[.!?]\s/g) ?? []).length;
    if (score > bestScore) {
      bestScore = score;
      best = pos;
    }
  }
  return best;
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|nav|header|footer|noscript|form|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
