import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, PenLine, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imageSrc, postTags, publishedPostsQuery } from "@/lib/blog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Insights — Engineering Notes from kalvoteq" },
      {
        name: "description",
        content:
          "Practical writing on architecture, cloud economics, applied AI, design systems, and building engineering teams in Europe.",
      },
      { property: "og:title", content: "Insights — Engineering Notes from kalvoteq" },
      { property: "og:description", content: "Field notes from delivery, written by the engineers doing the work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/insights" }],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data: posts = [], isLoading } = useQuery(publishedPostsQuery());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [email, setEmail] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.categories?.name).filter((n): n is string => Boolean(n))))],
    [posts],
  );

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchesCategory = category === "All" || p.categories?.name === category;
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      }),
    [posts, query, category],
  );

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Field notes from delivery"
        intro="Written by the engineers and consultants doing the work — architecture decisions, cost trade-offs, and lessons that cost us something to learn."
      >
        <Button asChild variant="outline">
          <Link to="/admin">
            <PenLine className="mr-1.5 h-4 w-4" /> Editorial workspace
          </Link>
        </Button>
      </PageHero>

      <Section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Search articles"
              placeholder="Search articles"
              className="pl-9"
              value={query}
              maxLength={80}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors",
                  category === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="mt-12 text-sm text-muted-foreground">Loading articles…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-16 text-center">
            <p className="font-semibold">No articles match that search</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or clear the category filter.</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <article key={post.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover">
                {post.cover_image_url && (
                  <Link to="/insights/$slug" params={{ slug: post.slug }}>
                    <img
                      src={imageSrc(post.cover_image_url)}
                      alt={post.title}
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-7">
                  {post.categories && (
                    <Badge variant="secondary" className="w-fit">
                      {post.categories.name}
                    </Badge>
                  )}
                  <h2 className="mt-4 text-lg font-semibold leading-snug">
                    <Link to="/insights/$slug" params={{ slug: post.slug }} className="hover:text-primary">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  {postTags(post).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {postTags(post).map((t) => (
                        <span key={t.id} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    )}
                    {post.reading_time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.reading_time}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow="Newsletter" title="One considered email a month" muted>
        <form
          className="flex max-w-md gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
              toast.error("Please enter a valid email address.");
              return;
            }
            setEmail("");
            toast.success("Subscribed. No spam, unsubscribe any time.");
          }}
        >
          <Input
            type="email"
            aria-label="Email address"
            placeholder="Work email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </Section>

      <CTASection />
    </>
  );
}
