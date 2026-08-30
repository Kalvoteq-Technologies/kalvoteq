// Server-only: fetches a source article and reduces it to plain text so it can
// be handed to Claude as research evidence. Deliberately simple — strips obvious
// chrome (script/style/nav/header/footer) rather than doing full readability
// extraction, and keeps only what's needed for one research call.

const USER_AGENT = "KalvoteqContentIntelligence/1.0 (+https://kalvoteq.com)";
const FETCH_TIMEOUT_MS = 10_000;

export async function extractArticleText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    const html = await res.text();
    return htmlToPlainText(html);
  } finally {
    clearTimeout(timeout);
  }
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
