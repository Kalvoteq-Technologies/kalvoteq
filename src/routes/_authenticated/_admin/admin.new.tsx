import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PostEditor } from "@/components/blog/PostEditor";
import { Section } from "@/components/site/Primitives";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/_admin/admin/new")({
  head: () => ({
    meta: [
      { title: "New article — kalvoteq Editorial" },
      { name: "description", content: "Write a new kalvoteq insights article with categories, tags and images." },
      { property: "og:title", content: "New article — kalvoteq Editorial" },
      { property: "og:description", content: "Draft a new insights article." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewPostPage,
});

function NewPostPage() {
  const { user } = useAuth();

  return (
    <Section>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to articles
      </Link>
      <h1 className="mt-6 text-3xl font-bold">New article</h1>
      <div className="mt-10">{user ? <PostEditor userId={user.id} /> : <p className="text-sm text-muted-foreground">Loading…</p>}</div>
    </Section>
  );
}
