import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { researchJobQuery } from "@/lib/content-intelligence/research-jobs";
import {
  categoriesQuery,
  imageSrc,
  postTags,
  readingTimeFromHtml,
  slugify,
  tagsQuery,
  uploadBlogImage,
  type PostRow,
  type PostStatus,
} from "@/lib/blog";
import { cn } from "@/lib/utils";

const VERIFICATION_LABELS = {
  verified: "Verified",
  partially_verified: "Partially verified",
  unverified: "Unverified",
} as const;

const VERIFICATION_BADGE_VARIANT = {
  verified: "default",
  partially_verified: "secondary",
  unverified: "destructive",
} as const;

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  slug: z.string().trim().min(3, "Slug is required").max(80),
  excerpt: z.string().trim().max(300, "Excerpt must be under 300 characters"),
});

export function PostEditor({ post, userId }: { post?: PostRow; userId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const coverInput = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: allTags = [] } = useQuery(tagsQuery());
  const { data: researchJob } = useQuery(researchJobQuery(post?.research_job_id));

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(post?.category_id ?? null);
  const [newCategory, setNewCategory] = useState("");
  const [tagIds, setTagIds] = useState<string[]>(post ? postTags(post).map((t) => t.id) : []);
  const [newTag, setNewTag] = useState("");
  const [cover, setCover] = useState<string | null>(post?.cover_image_url ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const blockedByVerification =
    post?.origin === "ai" &&
    post.verification_status === "unverified" &&
    post.status !== "published";

  const save = useMutation({
    mutationFn: async (status: PostStatus) => {
      const parsed = schema.safeParse({ title, slug, excerpt });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the form");

      const payload = {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        content,
        cover_image_url: cover,
        reading_time: readingTimeFromHtml(content),
        status,
        category_id: categoryId,
        author_id: userId,
        published_at:
          status === "published" ? (post?.published_at ?? new Date().toISOString()) : null,
      };

      let postId = post?.id;
      if (postId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", postId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("posts").insert(payload).select("id").single();
        if (error) throw error;
        postId = data.id;
      }

      const { error: delError } = await supabase.from("post_tags").delete().eq("post_id", postId!);
      if (delError) throw delError;
      if (tagIds.length > 0) {
        const { error: tagError } = await supabase
          .from("post_tags")
          .insert(tagIds.map((tag_id) => ({ post_id: postId!, tag_id })));
        if (tagError) throw tagError;
      }
      return { postId: postId!, status };
    },
    onSuccess: ({ postId, status }) => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(status === "published" ? "Post published" : "Draft saved");
      if (!post) navigate({ to: "/admin/$id", params: { id: postId } });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not save the post";
      toast.error(message.includes("duplicate key") ? "That slug is already in use." : message);
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!post) return;
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
      navigate({ to: "/admin" });
    },
    onError: () => toast.error("Could not delete the post"),
  });

  async function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug: slugify(name) })
      .select("id, name, slug")
      .single();
    if (error) {
      toast.error("Could not add that category");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    setCategoryId(data.id);
    setNewCategory("");
  }

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from("tags")
      .insert({ name, slug: slugify(name) })
      .select("id, name, slug")
      .single();
    if (error) {
      toast.error("Could not add that tag");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["tags"] });
    setTagIds((prev) => [...prev, data.id]);
    setNewTag("");
  }

  async function handleCover(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be smaller than 5 MB.");
      return;
    }
    setUploadingCover(true);
    try {
      setCover(await uploadBlogImage(file, userId));
    } catch {
      toast.error("Cover upload failed");
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            maxLength={160}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="What did you learn?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            maxLength={300}
            rows={3}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="One or two sentences shown in the article list."
          />
          <p className="text-xs text-muted-foreground">{excerpt.length}/300</p>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor value={content} onChange={setContent} userId={userId} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={post?.status === "published" ? "default" : "secondary"}>
              {post?.status === "published" ? "Published" : "Draft"}
            </Badge>
            {post?.origin === "ai" && <Badge variant="outline">AI-assisted</Badge>}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              disabled={save.isPending || blockedByVerification}
              onClick={() => save.mutate("published")}
            >
              {post?.status === "published" ? "Update published post" : "Publish"}
            </Button>
            {blockedByVerification && (
              <p className="text-xs text-destructive">
                This draft's sources are unverified — research it further before publishing.
              </p>
            )}
            <Button
              variant="outline"
              disabled={save.isPending}
              onClick={() => save.mutate("draft")}
            >
              {post?.status === "published" ? "Revert to draft" : "Save draft"}
            </Button>
            {post && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Delete this post permanently?")) remove.mutate();
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </div>

        {post?.origin === "ai" && (
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <p className="text-sm font-semibold">Verification</p>
              {post.verification_status && (
                <Badge
                  variant={VERIFICATION_BADGE_VARIANT[post.verification_status]}
                  className="mt-2"
                >
                  {VERIFICATION_LABELS[post.verification_status]}
                  {researchJob?.confidence_score != null &&
                    ` · ${researchJob.confidence_score}/100`}
                </Badge>
              )}
            </div>

            {researchJob?.briefing && (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kalvoteq angle
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {researchJob.briefing.kalvoteq_angle || "Not applicable to this story."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sources
                  </p>
                  <ul className="mt-2 space-y-2">
                    {(Array.isArray(researchJob.briefing.sources)
                      ? researchJob.briefing.sources
                      : []
                    ).map((s, i) => (
                      <li key={i} className="text-sm">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {s.title}
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {s.publisher} {s.is_primary ? "· primary" : "· secondary"} · credibility{" "}
                          {s.credibility_score}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          <Label htmlFor="slug">URL slug</Label>
          <Input
            id="slug"
            value={slug}
            maxLength={80}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
          />
          <p className="text-xs text-muted-foreground">/insights/{slug || "your-post"}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Cover image</p>
          {cover ? (
            <div className="mt-3 space-y-2">
              <img
                src={imageSrc(cover)}
                alt="Cover preview"
                className="aspect-video w-full rounded-lg object-cover"
              />
              <Button variant="ghost" size="sm" onClick={() => setCover(null)}>
                <X className="mr-1.5 h-4 w-4" /> Remove
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={uploadingCover}
              onClick={() => coverInput.current?.click()}
            >
              <ImagePlus className="mr-1.5 h-4 w-4" />
              {uploadingCover ? "Uploading…" : "Upload cover"}
            </Button>
          )}
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleCover(file);
            }}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={categoryId === c.id}
                onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-sm transition-colors",
                  categoryId === c.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={newCategory}
              maxLength={40}
              placeholder="New category"
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addCategory();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={() => void addCategory()}>
              Add
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tagIds.includes(t.id)}
                onClick={() =>
                  setTagIds((prev) =>
                    prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id],
                  )
                }
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-sm transition-colors",
                  tagIds.includes(t.id)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={newTag}
              maxLength={40}
              placeholder="New tag"
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={() => void addTag()}>
              Add
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
