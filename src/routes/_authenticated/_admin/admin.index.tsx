import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { myPostsQuery, postTags } from "@/lib/blog";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Editorial workspace — kalvoteq" },
      {
        name: "description",
        content: "Draft, edit and publish kalvoteq insights articles from the editorial workspace.",
      },
      { property: "og:title", content: "Editorial workspace — kalvoteq" },
      { property: "og:description", content: "Manage drafts and published insights articles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const { data: posts = [], isLoading } = useQuery(myPostsQuery(user?.id));
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  const visible = posts.filter((p) => filter === "all" || p.status === filter);

  return (
    <>
      <PageHero
        eyebrow="Editorial"
        title="Your articles"
        intro="Everything you have written, drafted, or published to the kalvoteq insights archive."
      >
        <Button asChild>
          <Link to="/admin/new">
            <Plus className="mr-1.5 h-4 w-4" /> New article
          </Link>
        </Button>
      </PageHero>

      <Section>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({posts.filter((p) => p.status === "draft").length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({posts.filter((p) => p.status === "published").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading your articles…</p>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-16 text-center">
            <FileText className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-semibold">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a new article and it will appear in this list.
            </p>
            <Button asChild className="mt-6">
              <Link to="/admin/new">Write an article</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
            {visible.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/admin/$id"
                    params={{ id: post.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {post.title || "Untitled"}
                  </Link>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {post.excerpt || "No excerpt yet"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                    {post.categories && <span>{post.categories.name}</span>}
                    {postTags(post).map((t) => (
                      <span key={t.id} className="rounded-full border border-border px-2 py-0.5">
                        {t.name}
                      </span>
                    ))}
                    <span>Updated {new Date(post.updated_at).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {post.status === "published" && (
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/insights/$slug" params={{ slug: post.slug }}>
                        View
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/$id" params={{ id: post.id }}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
