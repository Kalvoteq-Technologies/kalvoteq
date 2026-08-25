import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { ArticleBody } from "@/components/blog/ArticleBody";
import { CTASection, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { imageSrc, postTags, publishedPostQuery } from "@/lib/blog";

export const Route = createFileRoute("/insights/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — kalvoteq Insights` },
      { name: "description", content: "An engineering field note from the kalvoteq delivery team." },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — kalvoteq Insights` },
      { property: "og:description", content: "An engineering field note from the kalvoteq delivery team." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `/insights/${params.slug}` }],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery(publishedPostQuery(slug));

  if (isLoading) {
    return (
      <Section>
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </Section>
    );
  }

  if (!post) {
    return (
      <Section>
        <h1 className="text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-muted-foreground">This article may have been unpublished or moved.</p>
        <Button asChild className="mt-6">
          <Link to="/insights">Back to insights</Link>
        </Button>
      </Section>
    );
  }

  return (
    <>
      <article>
        <Section>
          <Link to="/insights" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All insights
          </Link>

          <div className="mt-8 max-w-3xl">
            {post.categories && <Badge variant="secondary">{post.categories.name}</Badge>}
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              )}
              {post.reading_time && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.reading_time}
                </span>
              )}
            </div>
          </div>

          {post.cover_image_url && (
            <img
              src={imageSrc(post.cover_image_url)}
              alt={post.title}
              className="mt-10 aspect-[16/7] w-full rounded-xl border border-border object-cover"
            />
          )}

          <div className="mt-12 max-w-3xl">
            <ArticleBody html={post.content} />
          </div>

          {postTags(post).length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
              {postTags(post).map((t) => (
                <span key={t.id} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </Section>
      </article>

      <CTASection />
    </>
  );
}
