import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type PostStatus = "draft" | "published";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export type PostOrigin = "manual" | "ai";
export type PostVerificationStatus = "verified" | "partially_verified" | "unverified";

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  reading_time: string | null;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  category_id: string | null;
  author_id: string | null;
  origin: PostOrigin;
  verification_status: PostVerificationStatus | null;
  research_job_id: string | null;
  categories: Category | null;
  post_tags: { tags: Tag | null }[];
}

// Keep the select string untyped so supabase-js does not parse it at the type level.
const sel = (s: string): string => s;

const POST_FIELDS = sel(
  "id, slug, title, excerpt, content, cover_image_url, reading_time, status, published_at, updated_at, created_at, category_id, author_id, origin, verification_status, research_job_id, categories(id, name, slug), post_tags(tags(id, name, slug))",
);

export function postTags(post: Pick<PostRow, "post_tags">): Tag[] {
  return (post.post_tags ?? []).map((pt) => pt.tags).filter((t): t is Tag => Boolean(t));
}

export function imageSrc(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/api/public/blog-image/${path}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function readingTimeFromHtml(html: string): string {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

export const publishedPostsQuery = () =>
  queryOptions({
    queryKey: ["posts", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .returns<PostRow[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const publishedPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["posts", "published", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle()
        .returns<PostRow | null>();
      if (error) throw error;
      return data;
    },
  });

export const myPostsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["posts", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("author_id", userId!)
        .order("updated_at", { ascending: false })
        .returns<PostRow[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

// Every AI-drafted post, regardless of which admin triggered generation —
// distinct from myPostsQuery, which only returns the current user's own posts.
export const aiPostsQuery = () =>
  queryOptions({
    queryKey: ["posts", "ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("origin", "ai")
        .order("updated_at", { ascending: false })
        .returns<PostRow[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const postByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["posts", "byId", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("id", id)
        .maybeSingle()
        .returns<PostRow | null>();
      if (error) throw error;
      return data;
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(sel("id, name, slug"))
        .order("name")
        .returns<Category[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export const tagsQuery = () =>
  queryOptions({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select(sel("id, name, slug"))
        .order("name")
        .returns<Tag[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

export async function uploadBlogImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("blog-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return `/api/public/blog-image/${path}`;
}
