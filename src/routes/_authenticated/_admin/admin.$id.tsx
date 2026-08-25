import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PostEditor } from "@/components/blog/PostEditor";
import { Section } from "@/components/site/Primitives";
import { useAuth } from "@/hooks/useAuth";
import { postByIdQuery } from "@/lib/blog";

export const Route = createFileRoute("/_authenticated/_admin/admin/$id")({
  head: () => ({
    meta: [
      { title: "Edit article — kalvoteq Editorial" },
      {
        name: "description",
        content:
          "Edit a kalvoteq insights article, manage its category, tags, cover image and publish state.",
      },
      { property: "og:title", content: "Edit article — kalvoteq Editorial" },
      { property: "og:description", content: "Edit an insights article." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditPostPage,
});

function EditPostPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: post, isLoading, isError } = useQuery(postByIdQuery(id));

  return (
    <Section>
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to articles
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Edit article</h1>
      <div className="mt-10">
        {isLoading || !user ? (
          <p className="text-sm text-muted-foreground">Loading article…</p>
        ) : isError || !post ? (
          <p className="text-sm text-muted-foreground">That article could not be found.</p>
        ) : (
          <PostEditor post={post} userId={user.id} />
        )}
      </div>
    </Section>
  );
}
