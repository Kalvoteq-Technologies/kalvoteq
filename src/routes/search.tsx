import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { caseStudies, industries, services } from "@/data/site";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — kalvoteq" },
      {
        name: "description",
        content: "Search services, industries, and case studies across the kalvoteq site.",
      },
      { property: "og:title", content: "Search — kalvoteq" },
      { property: "og:description", content: "Find services, industries, and case studies." },
      { property: "og:url", content: "/search" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: SearchPage,
});

type Entry = { title: string; type: string; text: string; href: string };

function SearchPage() {
  const [query, setQuery] = useState("");

  const entries: Entry[] = useMemo(
    () => [
      ...services.map((s) => ({
        title: s.title,
        type: "Service",
        text: s.summary,
        href: `/services/${s.slug}`,
      })),
      ...industries.map((i) => ({
        title: i.name,
        type: "Industry",
        text: i.blurb,
        href: `/industries/${i.slug}`,
      })),
      ...caseStudies.map((c) => ({
        title: c.title,
        type: "Case study",
        text: c.problem,
        href: `/case-studies/${c.slug}`,
      })),
    ],
    [],
  );

  const q = query.trim().toLowerCase();
  const results = q ? entries.filter((e) => `${e.title} ${e.text}`.toLowerCase().includes(q)) : [];

  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Find anything on this site"
        intro="Services, industries, and case studies."
      />
      <Section>
        <div className="relative max-w-xl">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            autoFocus
            aria-label="Search the site"
            placeholder="Try 'cloud migration' or 'healthcare'"
            className="pl-9"
            maxLength={80}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-10">
          {!q ? (
            <p className="text-sm text-muted-foreground">
              Start typing to search {entries.length} pages.
            </p>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-16 text-center">
              <p className="font-semibold">No results for "{query}"</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader term, or browse our services.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {results.map((r) => (
                <li key={r.href + r.title}>
                  <Link
                    to={r.href}
                    className="block bg-card p-6 transition-colors hover:bg-surface"
                  >
                    <Badge variant="secondary" className="mb-3">
                      {r.type}
                    </Badge>
                    <p className="font-semibold">{r.title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </>
  );
}
