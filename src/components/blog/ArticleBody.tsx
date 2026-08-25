import { useEffect, useState } from "react";

/** Renders CMS HTML after sanitising it in the browser. */
export function ArticleBody({ html }: { html: string }) {
  const [safe, setSafe] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("dompurify").then((mod) => {
      if (cancelled) return;
      setSafe(mod.default.sanitize(html, { USE_PROFILES: { html: true } }));
    });
    return () => {
      cancelled = true;
    };
  }, [html]);

  if (safe === null) {
    return <div className="h-40 animate-pulse rounded-lg bg-surface" aria-hidden="true" />;
  }

  return <div className="prose-article" dangerouslySetInnerHTML={{ __html: safe }} />;
}
